
export const elasticSearchSettings = {
  number_of_shards: 1,
  analysis: {
    filter: {
      car_filter: {
        type: 'edge_ngram',
        min_gram: 1,
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

