#!/bin/bash

# First run - use root to create users and harden the system
# ansible-playbook -i inventory.ini vps-hardening.yml --ask-pass

# Subsequent runs - use reza user
ansible-playbook -i inventory.ini vps-hardening.yml
