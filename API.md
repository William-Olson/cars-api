## API Endpoint Reference

Provides descriptions of _endpoints_, _parameters_, and _responses_ as well as basic _curl examples_.

**Tools**

You can use the provided [Postman Collections](https://github.com/William-Olson/cars-api/blob/master/README.md#Postman) or the [Swagger UI](https://github.com/William-Olson/cars-api/blob/master/README.md#Swagger) for testing the API.

**Sections**

- [cars](#Cars)
- [models](#Models)
- [makes](#Makes)
- [colors](#Colors)
- [body-styles](#BodyStyles)
- [search](#Search)

---

## Cars

### GET `/cars/`

Fetch all cars.

**Query Parameters**

- `limit` represents the maximum number of items to retrieve. Default is 100.
- `offset` represents the index of where to start the retrieval. Default is 0.

_Note:_ The `limit` and `offset` parameters can be utilized to achieve pagination.

**Example**

```bash
curl -X GET 'http://<server-address>/cars?limit=100&offset=0'
```

**Response**

The response payload will include a `total` property representing the total rows found in the database and
a `results` property containing an array of results with max size specified by the `limit` query param.

```js
{
  "total": 500,
  "results": [
    {
      "id": 1,
      "year": 2020,
      "color": {
        "id": 1,
        "name": "black"
      },
      "model": {
        "id": 1,
        "name": "r8",
        "make": {
          "id": 1,
          "name": "audi"
        },
        "bodyStyle": {
          "id": 1,
          "name": "sport"
        }
      }
    },
    // ... etc.
  ]
}
```

### GET `/cars/{id}`

Get a specific car by its `ID`.

**Parameters**

- `id` is the id of the car to retrieve.

**Example**

```bash
curl -X GET 'http://<server-address>/cars/1'
```

**Response**

The response will contain the resource with the matching id.

```js
{
  "id": 1,
  "year": 2020,
  "color": {
    "id": 1,
    "name": "black"
  },
  "model": {
    "id": 1,
    "name": "r8",
    "make": {
      "id": 1,
      "name": "audi"
    },
    "bodyStyle": {
      "id": 1,
      "name": "sport"
    }
  }
}
```

### POST `/cars/`

Create a new car.

**Request Payload**

- `modelId` is the id of the model of the car.
- `year` is the full four digit year of the car.
- `colorId` is the id of the color of the car.

**Example**

```bash
curl -X POST http://<server-address>/cars \
  -H 'content-type: application/json' \
  -d '{
    "modelId": 1,
    "year": "2020",
    "colorId": 1
	}'
```

**Response**

The response will contain the created resource.

```js
{
  "id": 1,
  "year": 2020,
  "color": {
    "id": 1,
    "name": "black"
  },
  "model": {
    "id": 1,
    "name": "r8",
    "make": {
      "id": 1,
      "name": "audi"
    },
    "bodyStyle": {
      "id": 1,
      "name": "sport"
    }
  }
}
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
curl -X PUT http://<server-address>/cars/1 \
  -H 'content-type: application/json' \
  -d '{
    "modelId": 2,
    "year": "2019",
    "colorId": 2
	}'
```

**Response**

The response will contain the updated resource.

```js
{
  "id": 1,
  "year": 2019,
  "color": {
    "id": 2,
    "name": "silver"
  },
  "model": {
    "id": 2,
    "name": "tts",
    "make": {
      "id": 1,
      "name": "audi"
    },
    "bodyStyle": {
      "id": 2,
      "name": "coupe"
    }
  }
}
```


### DELETE `/cars/{id}`

Delete a car.

**Parameters**

- `id` is the id of the car to delete.

**Example**

```bash
curl -X DELETE http://<server-address>/cars/1
```

**Response**

The response will have a `success` boolean and a `message` property indicating the resource was deleted.

```js
{
  "success": true,
  "message": "Deleted car with id 1"
}
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
curl -X GET 'http://<server-address>/models?limit=100&offset=0'
```

**Response**

The response payload will include a `total` property representing the total rows found in the database and
a `results` property containing an array of results with max size specified by the `limit` query param.

```js
{
  "total": 500,
  "results": [
     {
      "id": 1,
      "name": "r8",
      "availableColors": [
        { "id": 1, "name": "black" }
      ],
      "bodyStyle": { "id": 1, "name": "sport" },
      "make": { "id": 1, "name": "audi" }
    },
    // ... etc.
  ]
}
```

### GET `/models/{id}`

Get a specific model by its `ID`.

**Parameters**

- `id` is the id of the model to retrieve.

**Example**

```bash
curl -X GET 'http://<server-address>/models/1'
```

**Response**

The response will contain the resource with the matching id.

```js
{
  "id": 1,
  "name": "r8",
  "availableColors": [
    { "id": 1, "name": "black" }
  ],
  "bodyStyle": { "id": 1, "name": "sport" },
  "make": { "id": 1, "name": "audi" }
}
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
curl -X POST http://<server-address>/models \
  -H 'content-type: application/json' \
  -d '{
    "colorIds": [ 1 ],
    "makeId": 1,
    "bodyStyleId": 1,
    "name": "r8"
  }'
```

**Response**

The response will contain the created resource.

```js
{
  "id": 1,
  "name": "r8",
  "availableColors": [
    { "id": 1, "name": "black" }
  ],
  "bodyStyle": { "id": 1, "name": "sport" },
  "make": { "id": 1, "name": "audi" }
}
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
curl -X PUT http://<server-address>/models/1 \
  -H 'content-type: application/json' \
  -d '{
    "colorIds": [ 1, 2 ],
    "makeId": 1,
    "bodyStyleId": 2,
    "name": "tts"
	}'
```

**Response**

The response will contain the updated resource.

```js
{
  "id": 1,
  "name": "tts",
  "availableColors": [
    { "id": 1, "name": "black" },
    { "id": 2, "name": "silver" }
  ],
  "bodyStyle": { "id": 2, "name": "coupe" },
  "make": { "id": 1, "name": "audi" }
}
```

### DELETE `/models/{id}`

Delete a model.

**Parameters**

- `id` is the id of the model to delete.

**Example**

```bash
curl -X DELETE http://<server-address>/models/1
```

**Response**

The response will have a `success` boolean and a `message` property indicating the resource was deleted.

```js
{
  "success": true,
  "message": "Deleted model with id 1"
}
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
curl -X GET 'http://<server-address>/makes?limit=100&offset=0'
```

**Response**

The response payload will include a `total` property representing the total rows found in the database and
a `results` property containing an array of results with max size specified by the `limit` query param.

```js
{
  "total": 500,
  "results": [
    {
      "id": 1,
      "name": "audi"
    },
    // ... etc.
  ]
}
```

### GET `/makes/{id}`

Get a specific make by its `ID`.

**Parameters**

- `id` is the id of the make to retrieve.

**Example**

```bash
curl -X GET 'http://<server-address>/makes/1'
```

**Response**

The response will contain the resource with the matching id.

```js
{
  "id": 1,
  "name": "audi"
}
```


### POST `/makes/`

Create a new make.

**Request Payload**

- `name` is the unique name of the make.

**Example**

```bash
curl -X POST http://<server-address>/makes \
  -H 'content-type: application/json' \
  -d '{ "name": "audi" }'
```

**Response**

The response will contain the created resource.

```js
{
  "name": "audi",
  "id": 1
}
```

### PUT `/makes/{id}`

Update an existing make.

**Parameters**

- `id` is the id of the make to update.

**Request Payload**

- `name` is the unique name of the make.

**Example**

```bash
curl -X PUT http://<server-address>/makes/1 \
  -H 'content-type: application/json' \
  -d '{ "name": "tesla" }'
```

**Response**

The response will contain the updated resource.

```js
{
  "name": "tesla",
  "id": 1
}
```

### DELETE `/makes/{id}`

Delete a make.

**Parameters**

- `id` is the id of the make to delete.

**Example**

```bash
curl -X DELETE http://<server-address>/makes/1
```

**Response**

The response will have a `success` boolean and a `message` property indicating the resource was deleted.

```js
{
  "success": true,
  "message": "Deleted make with id 1"
}
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
curl -X GET 'http://<server-address>/colors?limit=100&offset=0'
```

**Response**

The response payload will include a `total` property representing the total rows found in the database and
a `results` property containing an array of results with max size specified by the `limit` query param.

```js
{
  "total": 500,
  "results": [
    {
      "id": 1,
      "name": "black"
    },
    // ... etc.
  ]
}
```

### GET `/colors/{id}`

Get a specific color by its `ID`.

**Parameters**

- `id` is the id of the color to retrieve.

**Example**

```bash
curl -X GET 'http://<server-address>/colors/1'
```

**Response**

The response will contain the resource with the matching id.

```js
{
  "id": 1,
  "name": "black"
}
```

### POST `/colors/`

Create a new color.

**Request Payload**

- `name` is the unique name of the color.

**Example**

```bash
curl -X POST http://<server-address>/colors \
  -H 'content-type: application/json' \
  -d '{ "name": "black" }'
```

**Response**

The response will contain the created resource.

```js
{
  "name": "black",
  "id": 1
}
```

### PUT `/colors/{id}`

Update an existing color.

**Parameters**

- `id` is the id of the color to update.

**Request Payload**

- `name` is the unique name of the color.

**Example**

```bash
curl -X PUT http://<server-address>/colors/1 \
  -H 'content-type: application/json' \
  -d '{ "name": "silver" }'
```

**Response**

The response will contain the updated resource.

```js
{
  "id": 1,
  "name": "silver"
}
```

### DELETE `/colors/{id}`

Delete a color.

**Parameters**

- `id` is the id of the color to delete.

**Example**

```bash
curl -X DELETE http://<server-address>/colors/1
```

**Response**

The response will have a `success` boolean and a `message` property indicating the resource was deleted.

```js
{
  "success": true,
  "message": "Deleted color with id 1"
}
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
curl -X GET 'http://<server-address>/body-styles?limit=100&offset=0'
```

**Response**

The response payload will include a `total` property representing the total rows found in the database and
a `results` property containing an array of results with max size specified by the `limit` query param.

```js
{
  "total": 500,
  "results": [
    {
      "id": 1,
      "name": "sport"
    },
    // ... etc.
  ]
}
```

### GET `/body-styles/{id}`

Get a specific body-style by its `ID`.

**Parameters**

- `id` is the id of the body-style to retrieve.

**Example**

```bash
curl -X GET 'http://<server-address>/body-styles/1'
```

**Response**

The response will contain the resource with the matching id.

```js
{
  "id": 1,
  "name": "sport"
}
```

### POST `/body-styles/`

Create a new body-style.

**Request Payload**

- `name` is the unique name of the body-style.

**Example**

```bash
curl -X POST http://<server-address>/body-styles \
  -H 'content-type: application/json' \
  -d '{ "name": "sedan" }'
```

**Response**

The response will contain the created resource.

```js
{
  "name": "sedan",
  "id": 1
}
```

### PUT `/body-styles/{id}`

Update an existing body-style.

**Parameters**

- `id` is the id of the body-style to update.

**Request Payload**

- `name` is the unique name of the body-style.

**Example**

```bash
curl -X PUT http://<server-address>/body-styles/1 \
  -H 'content-type: application/json' \
  -d '{ "name": "sport" }'
```

**Response**

The response will contain the updated resource.

```js
{
  "id": 1,
  "name": "sport"
}
```

### DELETE `/body-styles/{id}`

Delete a body-style.

**Parameters**

- `id` is the id of the body-style to delete.

**Example**

```bash
curl -X DELETE http://<server-address>/body-styles/1
```

**Response**

The response will have a `success` boolean and a `message` property indicating the resource was deleted.

```js
{
  "success": true,
  "message": "Deleted body-style with id 1"
}
```

---

## Search

### GET `/search/`

Fetch a filtered list of cars via search parameters.

**Query Parameters**

- `limit` represents the maximum number of items to retrieve.
- `offset` represents the index of where to start the retrieval.
- `make` is the search input for the make of the car.
- `model` is the search input for the model of the car.
- `year` is the search input for the year of the car.
- `bodyStyle` is the search input for the bodyStyle of the car.
- `color` is the search input for the color of the car.

**Examples**

Provide as few params as you want.

```bash
curl -X GET 'http://<server-address>/search?bodyStyle=sport'
```

Or provide all parameters for specific searching.

```bash
curl -X GET \
  'http://<server-address>/search?limit=100&offset=0&year=2020&make=audi&color=black&bodyStyle=sport&model=r8'
```

**Response**

The response payload will include a `total` property representing the total rows found in the database and
a `results` property containing an array of results with max size specified by the `limit` query param.

```js
{
  "total": 500,
  "results": [
    {
      "id": 1,
      "year": 2020,
      "color": {
        "id": 1,
        "name": "black"
      },
      "model": {
        "id": 1,
        "name": "r8",
        "make": {
          "id": 1,
          "name": "audi"
        },
        "bodyStyle": {
          "id": 1,
          "name": "sport"
        }
      }
    },
    // ... etc.
  ]
}
