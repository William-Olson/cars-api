/*

  Defines a custom analyzer and filter.
  Text is converted to lowercase and broken up into
  tokens at n-gram length.

*/
export const elasticSearchSettings = {
  number_of_shards: 1,
  analysis: {
    filter: {
      car_filter: {
        type: 'edge_ngram',
        min_gram: 2,
        max_gram: 20
      }
    },
    analyzer: {
      car_analyzer: {
        type:      'custom',
        tokenizer: 'standard',
        filter: [
          'lowercase',
          'car_filter'
        ]
      }
    }
  }
};

/*

  Defines Elasticsearch field types and analyzers for cars.

*/
export const elasticSearchMappings = {
  default: {
    properties: {
      year: {
        type: 'text',
        analyzer: 'car_analyzer'
      },
      model: {
        type: 'text',
        analyzer: 'car_analyzer'
      },
      make: {
        type: 'text',
        analyzer: 'car_analyzer'
      },
      color: {
        type: 'text',
        analyzer: 'car_analyzer'
      },
      body_style: {
        type: 'text',
        analyzer: 'car_analyzer'
      }
    }
  }
};

