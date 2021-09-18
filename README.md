
## POST service/task/subscribe

Subscribes user

### Request Headers
	* Authorization: Bearer token

Request body:
```json
{
	"endpoint": "https://random-push-service.com/some-kind-of-unique-id-1234/v2/",
	"p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM=",
	"auth": "tBHItJI5svbpez7KI4CCXg=="
}
```

Response:
* HTTP code 201
```json

{
}
```

* HTTP code 405
```json
{ "message": "Unauthorized" }
```
* HTTP code 500
```json
{ "message": "Server Error" }
```
## POST service/task/unsubscribe

Unsubscribes user

### Request Headers
	* Authorization: Bearer token

Request body:
```json
{
	"endpoint": "https://random-push-service.com/some-kind-of-unique-id-1234/v2/"
}
```

Response:
* HTTP code 201
```json

{
}
```

* HTTP code 405
```json
{ "message": "Unauthorized" }
```
* HTTP code 500
```json
{ "message": "Server Error" }
```
