Kubernetes instructions

Reset:
```
k delete deployment $(k get deployments |awk '{ print $1 }' )
k delete svc $(k get svc |awk '{ print $1 }' )
````

Geth:
```
helm install --name eth stable/ethereum  --set geth.account.address=0xC6329568bf82708F83886b8c1c1937859e0DB604 --set geth.account.privateKey=9ccbce6320f15611e494b89d14a69f67f19eba48d150337d0ceee846841e062e  --set geth.account.secret=superpassword --set geth.genesis.difficulty=0x0
```

Hostname:
```
eth-ethereum-geth-tx.svc.cluster.local:8545
eth-ethereum-geth-tx.svc.cluster.local:8546
```