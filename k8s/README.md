General setup

```
docker build backend/world/ --tag kryha/world && docker push kryha/world
docker build backend/ethereum/ --tag kryha/contracts && docker push kryha/contracts
sudo kubectl apply -f k8s/

```