## API Endpoint Reference

**Sections**

- [cars](#Cars)
- [models](#Models)
- [makes](#Makes)
- [colors](#Colors)
- [body-styles](#BodyStyles)

---

## Cars

### GET `/cars/`

Fetch all cars.

**Query Parameters**

- `limit` represents the maximum number of items to retrieve.
- `offset` represents the index of where to start the retrieval.

**Example**

```bash
curl -X GET 'http://<ip-address>/cars?limit=100&offset=0'
```

### GET `/cars/{id}`

Get a specific car by its `ID`.

**Parameters**

- `id` is the id of the car to retrieve.

**Example**

```bash
curl -X GET 'http://<ip-address>/cars/1'
```

### POST `/cars/`

Create a new car.

**Request Payload**

- `modelId` is the id of the model of the car.
- `year` is the full four digit year of the car.
- `colorId` is the id of the color of the car.

**Example**

```bash
curl -X POST http://<ip-address>:3000/cars \
  -H 'content-type: application/json' \
  -d '{
    "modelId": 1,
    "year": "2020",
    "colorId": 1
	}'
```


### PUT `/cars/{id}`

Update an existing car.

**Parameters**

- `id` is the id of the car to update.

**Request Payload**

- `modelId` is the id of the model of the car.
- `year` is the full four digit year of the car.
- `colorId` is the id of the color of the car.

**Example**

```bash
curl -X PUT http://<ip-address>:3000/cars/1 \
  -H 'content-type: application/json' \
  -d '{
    "modelId": 2,
    "year": "2019",
    "colorId": 2
	}'
```


### DELETE `/cars/{id}`

Delete a car.

**Parameters**

- `id` is the id of the car to delete.

**Example**

```bash
curl -X DELETE http://<ip-address>:3000/cars/1
```

---

## Models

### GET `/models/`

Fetch all models.

**Query Parameters**

- `limit` represents the maximum number of items to retrieve.
- `offset` represents the index of where to start the retrieval.

**Example**

```bash
curl -X GET 'http://<ip-address>/models?limit=100&offset=0'
```

### GET `/models/{id}`

Get a specific model by its `ID`.

**Parameters**

- `id` is the id of the model to retrieve.

**Example**

```bash
curl -X GET 'http://<ip-address>/models/1'
```



### POST `/models/`


Create a new model.

**Request Payload**

- `name` is the unique name of the model.
- `makeId` is the id of the make of the model.
- `bodyStyleId` is the id of the body-style of the model.
- `colorIds` are the ids of the colors this model comes in.

**Example**

```bash
curl -X POST http://<ip-address>:3000/models \
  -H 'content-type: application/json' \
  -d '{
    "colorIds": [ 1 ],
    "makeId": 1,
    "bodyStyleId": 1,
    "name": "r8"
  }'
```


### PUT `/models/{id}`

Update an existing model.

**Parameters**

- `id` is the id of the model to update.

**Request Payload**

- `name` is the unique name of the model.
- `makeId` is the id of the make of the model.
- `bodyStyleId` is the id of the body-style of the model.
- `colorIds` are the ids of the colors this model comes in.

**Example**

```bash
curl -X PUT http://<ip-address>:3000/models/1 \
  -H 'content-type: application/json' \
  -d '{
    "colorIds": [ 1, 2 ],
    "makeId": 1,
    "bodyStyleId": 2,
    "name": "r8"
	}'
```

### DELETE `/models/{id}`

Delete a model.

**Parameters**

- `id` is the id of the model to delete.

**Example**

```bash
curl -X DELETE http://<ip-address>:3000/models/1
```

---

## Makes

### GET `/makes/`

Fetch all makes.

**Query Parameters**

- `limit` represents the maximum number of items to retrieve.
- `offset` represents the index of where to start the retrieval.

**Example**

```bash
curl -X GET 'http://<ip-address>/makes?limit=100&offset=0'
```

### GET `/makes/{id}`

Get a specific make by its `ID`.

**Parameters**

- `id` is the id of the make to retrieve.

**Example**

```bash
curl -X GET 'http://<ip-address>/makes/1'
```



### POST `/makes/`

Create a new make.

**Request Payload**

- `name` is the unique name of the make.

**Example**

```bash
curl -X POST http://<ip-address>:3000/makes \
  -H 'content-type: application/json' \
  -d '{ "name": "audi" }'
```


### PUT `/makes/{id}`

Update an existing make.

**Parameters**

- `id` is the id of the make to update.

**Request Payload**

- `name` is the unique name of the make.

**Example**

```bash
curl -X PUT http://<ip-address>:3000/makes/1 \
  -H 'content-type: application/json' \
  -d '{ "name": "tesla" }'
```


### DELETE `/makes/{id}`

Delete a make.

**Parameters**

- `id` is the id of the make to delete.

**Example**

```bash
curl -X DELETE http://<ip-address>:3000/makes/1
```

---

## Colors

### GET `/colors/`

Fetch all colors.

**Query Parameters**

- `limit` represents the maximum number of items to retrieve.
- `offset` represents the index of where to start the retrieval.

**Example**

```bash
curl -X GET 'http://<ip-address>/colors?limit=100&offset=0'
```

### GET `/colors/{id}`

Get a specific color by its `ID`.

**Parameters**

- `id` is the id of the color to retrieve.

**Example**

```bash
curl -X GET 'http://<ip-address>/colors/1'
```

### POST `/colors/`

Create a new color.

**Request Payload**

- `name` is the unique name of the color.

**Example**

```bash
curl -X POST http://<ip-address>:3000/colors \
  -H 'content-type: application/json' \
  -d '{ "name": "black" }'
```


### PUT `/colors/{id}`

Update an existing color.

**Parameters**

- `id` is the id of the color to update.

**Request Payload**

- `name` is the unique name of the color.

**Example**

```bash
curl -X PUT http://<ip-address>:3000/colors/1 \
  -H 'content-type: application/json' \
  -d '{ "name": "silver" }'
```


### DELETE `/colors/{id}`

Delete a color.

**Parameters**

- `id` is the id of the color to delete.

**Example**

```bash
curl -X DELETE http://<ip-address>:3000/colors/1
```


---

## BodyStyles

### GET `/body-styles/`

Fetch all body-styles.

**Query Parameters**

- `limit` represents the maximum number of items to retrieve.
- `offset` represents the index of where to start the retrieval.

**Example**

```bash
curl -X GET 'http://<ip-address>/body-styles?limit=100&offset=0'
```

### GET `/body-styles/{id}`

Get a specific body-style by its `ID`.

**Parameters**

- `id` is the id of the body-style to retrieve.

**Example**

```bash
curl -X GET 'http://<ip-address>/body-styles/1'
```

### POST `/body-styles/`

Create a new body-style.

**Request Payload**

- `name` is the unique name of the body-style.

**Example**

```bash
curl -X POST http://<ip-address>:3000/body-styles \
  -H 'content-type: application/json' \
  -d '{ "name": "sedan" }'
```


### PUT `/body-styles/{id}`

Update an existing body-style.

**Parameters**

- `id` is the id of the body-style to update.

**Request Payload**

- `name` is the unique name of the body-style.

**Example**

```bash
curl -X PUT http://<ip-address>:3000/body-styles/1 \
  -H 'content-type: application/json' \
  -d '{ "name": "sport" }'
```


### DELETE `/body-styles/{id}`

Delete a body-style.

**Parameters**

- `id` is the id of the body-style to delete.

**Example**

```bash
curl -X DELETE http://<ip-address>:3000/body-styles/1
```
