# K3s VPS Hardening with Ansible

This Ansible playbook prepares and hardens a VPS for K3s Kubernetes deployment.

## Features

### User Management
- Creates two users: `reza` and `mani`
- SSH key-based authentication only
- Passwordless sudo access
- Disables root login

### Security Hardening
- **SSH Hardening**: Disables password authentication, root login, and X11 forwarding
- **Firewall (UFW)**: Configured with default deny incoming, allow outgoing
- **Fail2ban**: Protects against brute-force SSH attacks
- **Automatic Security Updates**: Unattended upgrades for security patches
- **Kernel Hardening**: Sysctl parameters optimized for security and K3s

### K3s Prerequisites
- Opens required K3s ports (6443, 10250, 8472, etc.)
- Opens HTTP/HTTPS for ingress (80, 443)
- Enables IP forwarding
- Configures bridge netfilter
- Disables swap
- Loads required kernel modules (overlay, br_netfilter)

## Firewall Ports

The following ports are opened:

| Port | Protocol | Purpose |
|------|----------|---------|
| 22 | TCP | SSH |
| 80 | TCP | HTTP (Ingress) |
| 443 | TCP | HTTPS (Ingress) |
| 6443 | TCP | K3s API Server |
| 10250 | TCP | Kubelet metrics |
| 8472 | UDP | Flannel VXLAN |
| 51820-51821 | UDP | Flannel WireGuard (optional) |

## Prerequisites

1. **Ansible installed** on your local machine:
   ```bash
   pip install ansible
   ```

2. **SSH private key** for accessing the VPS (referenced in `inventory.ini`)

3. **Root access** to the VPS for initial setup

## Setup Instructions

### 1. Configure Inventory

Edit `inventory.ini` and add your VPS details:

```ini
[k3s_servers]
ottero_k3s ansible_host=YOUR_VPS_IP ansible_user=root ansible_ssh_private_key_file=~/dev/scripts-personal/contabo/ssh_key
```

### 2. Add Mani's Public Key

Edit `k3s-hardening.yml` and replace `ADD_MANI_PUBLIC_KEY_HERE` with Mani's actual SSH public key.

### 3. Run the Playbook

**First run (as root):**
```bash
chmod +x run.sh
./run.sh
```

Or manually:
```bash
ansible-playbook -i inventory.ini k3s-hardening.yml --ask-pass -vvv
```

**Subsequent runs (as reza):**

After the initial setup, update `inventory.ini` to use the `reza` user instead of `root`, then run:
```bash
ansible-playbook -i inventory.ini k3s-hardening.yml -vvv
```

## Post-Hardening Steps

After running this playbook, your VPS will be ready for K3s installation. To install K3s:

```bash
# SSH into the VPS as reza
ssh -i ~/dev/scripts-personal/contabo/ssh_key reza@YOUR_VPS_IP

# Install K3s
curl -sfL https://get.k3s.io | sh -

# Check K3s status
sudo systemctl status k3s

# Get kubeconfig
sudo cat /etc/rancher/k3s/k3s.yaml
```

## Security Notes

- **Root login is disabled** after the first run
- **Password authentication is disabled** - only SSH keys work
- **Fail2ban** will ban IPs after 3 failed SSH attempts
- **Automatic security updates** are enabled
- **UFW firewall** is active with minimal required ports open

## Troubleshooting

### Can't connect after running playbook

If you get locked out, you may need to:
1. Access the VPS console through your hosting provider
2. Re-enable root login temporarily
3. Check SSH key configuration

### Firewall blocking connections

To temporarily disable UFW:
```bash
sudo ufw disable
```

To check UFW status:
```bash
sudo ufw status verbose
```

## Customization

To modify the playbook:

- **Add more users**: Edit the `users` list in `k3s-hardening.yml`
- **Change ports**: Modify the `k3s_ports` or `web_ports` variables
- **Adjust fail2ban**: Edit the fail2ban configuration task
- **Modify sysctl parameters**: Update the kernel hardening task

## References

- [K3s Documentation](https://docs.k3s.io/)
- [Ansible Documentation](https://docs.ansible.com/)
- [UFW Documentation](https://help.ubuntu.com/community/UFW)
