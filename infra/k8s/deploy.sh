#!/bin/bash
set -e

echo "🚀 Starting Ottero Kubernetes Deployment..."

# 0. Infrastructure & Utilities
echo "Step 0: Installing/Verifying Cert Manager..."
./00-cert_manager.sh || echo "Cert-manager might already be installed"

echo "Step 1: Applying Namespace and Secrets..."
kubectl apply -f 00-namespace.yaml
kubectl apply -f 01-ghcr-secret.yaml
kubectl apply -f 02-secrets.yaml

echo "Step 2: Applying Configurations..."
kubectl apply -f 09-frontend-config-prod.yaml
kubectl apply -f 03-mysql-config.yaml
kubectl apply -f 08-cluster-issuer.yaml

echo "Step 3: Deploying Database..."
kubectl apply -f 04-mysql-deployment.yaml

echo "Step 4: Deploying Backend & Frontend..."
kubectl apply -f 05-backend.yaml
kubectl apply -f 06-frontend.yaml

echo "Step 5: Configuring Ingress..."
kubectl apply -f 07-ingress.yaml

echo "✅ Deployment applied successfully!"
echo "   - Backend: https://ottero.com.au/api/actuator/health (Check logs if 403)"
echo "   - Frontend: https://ottero.com.au"
