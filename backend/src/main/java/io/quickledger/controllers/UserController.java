package io.quickledger.controllers;

import io.quickledger.dto.UserDto;
import io.quickledger.entities.Company;
import io.quickledger.entities.User;
import io.quickledger.mappers.UserMapper;
import io.quickledger.services.CompanyService;
import io.quickledger.services.UserService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

import jakarta.annotation.PostConstruct;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;
    private final CompanyService companyService;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Value("${auth0.webhook.secret}")
    private String auth0WebhookSecret;

    @Autowired
    public UserController(UserService userService, CompanyService companyService) {
        this.userService = userService;
        this.companyService = companyService;
    }

    @PostConstruct
    public void init() {
        logger.info("Auth0 webhook secret loaded: [{}] (length: {})", auth0WebhookSecret, auth0WebhookSecret != null ? auth0WebhookSecret.length() : 0);
    }

    @GetMapping("")
    public List<UserDto> getAllUsers() {
        logger.debug("===> Getting all users");
        Iterable<User> users = userService.getAllUsers();
        List<User> userList = StreamSupport.stream(users.spliterator(), false).collect(Collectors.toList());
        return UserMapper.INSTANCE.toDtoList(userList);
    }

    @GetMapping("/{id}")
    public UserDto getUserById(@PathVariable Long id) {
        logger.debug("===> Getting user with id: {}", id);
        Optional<User> user = userService.getUserById(id);
        return user.map(UserMapper.INSTANCE::toDto).orElse(null);
    }

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(@RequestHeader("X-User-Id") String userExternalId) {
        logger.debug("===> Getting profile for user: {}", userExternalId);
        Optional<User> userOpt = userService.findByExternalId(userExternalId);
        if (userOpt.isPresent()) {
            UserDto userDto = userService.getUserProfile(userOpt.get().getId());
            return ResponseEntity.ok(userDto);
        }
        return ResponseEntity.notFound().build();
    }

    /*
     * webhook for auth0 to create user on signup
     * https://auth0.com/docs/customize/actions/explore-triggers/signup-and-login-
     * triggers/post-user-registration-trigger/post-user-registration-event-object
     * 
     * Auth0’s Post-User Registration Action only triggers for database connections,
     * not for social logins.
     * However, you can achieve similar functionality for social logins using
     * Post-Login Actions instead.
     * 
     */
    @PostMapping("/auth0-webhook-create")
    public ResponseEntity<String> auth0Create(@RequestBody Map<String, Object> payload,
            @RequestHeader("Authorization") String authorizationHeader) {
        logger.debug("===> Auth0 webhook create user");

        if (!isAuth0ReqAuthorized(authorizationHeader))
            return ResponseEntity.status(401).body("Unauthorized");

        Optional<User> existingUser = userService.findByEmail((String) payload.get("email"));
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            String incomingUserId = (String) payload.get("user_id");
            if (user.getExternalId() == null || !user.getExternalId().equals(incomingUserId)) {
                logger.info("Updating existing user {} with new externalId {}", user.getEmail(), incomingUserId);
                user.setExternalId(incomingUserId);
                userService.saveUser(user);
            }
            logger.debug("User already exists with email: {}. Updates applied if necessary.", user.getEmail());
            return ResponseEntity.status(HttpStatus.NO_CONTENT).body("");
        }

        User user = new User();
        user.setEmail((String) payload.get("email"));
        String givenName = (String) payload.get("given_name");
        String familyName = (String) payload.get("family_name");

        // Handle cases where names might be missing (e.g. some email logins)
        if (givenName == null)
            givenName = "User";
        if (familyName == null)
            familyName = "";

        user.setName(givenName);
        user.setSurname(familyName);
        user.setExternalId((String) payload.get("user_id"));
        user.setRegisterDateTime(java.time.LocalDateTime.now());
        user.setStatus("ACTIVE");

        userService.saveUser(user);

        // Auto-create a default company for the new user
        Company company = new Company();
        company.setName(givenName + "'s Company");
        companyService.createCompanyWithUser(company, user, null);
        logger.info("Created default company for new user: {}", user.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED).body("User created");
    }

    private boolean isAuth0ReqAuthorized(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            logger.warn("Auth header missing or doesn't start with Bearer. Header: {}", authorizationHeader);
            return false;
        }
        String token = authorizationHeader.substring(7);
        logger.debug("Received token: [{}], Expected: [{}]", token, auth0WebhookSecret);
        boolean matches = auth0WebhookSecret.equals(token);
        if (!matches) {
            logger.warn("Token mismatch! Received length: {}, Expected length: {}", token.length(), auth0WebhookSecret.length());
        }
        return matches;
    }

    @PutMapping("/{id}")
    public UserDto updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        logger.debug("===> Updating user with id: {}", id);
        return UserMapper.INSTANCE.toDto(userService.updateUser(id, userDto));
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}