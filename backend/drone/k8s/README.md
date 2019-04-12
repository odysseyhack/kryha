Kubernetes instructions

Reset:
```
k delete deployment $(k get deployments |awk '{ print $1 }' )
k delete svc $(k get svc |awk '{ print $1 }' )
helm delete ganache
helm delete eth
````

Ganache:
```
helm install --name ganache drone/k8s/ganache.
```


Geth:
```
helm install --name eth stable/ethereum  --set geth.account.address=0xC6329568bf82708F83886b8c1c1937859e0DB604 --set geth.account.privateKey=9ccbce6320f15611e494b89d14a69f67f19eba48d150337d0ceee846841e062e  --set geth.account.secret=superpassword --set geth.genesis.difficulty=0x0
```

Hostname:
```
eth-ethereum-geth-tx.svc.cluster.local:8545
eth-ethereum-geth-tx.svc.cluster.local:8546
```

ETH stuff:
```
 1. View the EthStats dashboard at:
    export SERVICE_IP=$(kubectl get svc --namespace default eth-ethereum-ethstats -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
    echo http://$SERVICE_IP

    NOTE: It may take a few minutes for the LoadBalancer IP to be available.
          You can watch the status of by running 'kubectl get svc -w eth-ethereum-ethstats-service'

  2. Connect to Geth transaction nodes (through RPC or WS) at the following IP:
    export POD_NAME=$(kubectl get pods --namespace default -l "app=ethereum,release=eth,component=geth-tx" -o jsonpath="{.items[0].metadata.name}")
    kubectl port-forward $POD_NAME 8545:8545 8546:8546
    ```