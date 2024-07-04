// Transforms the error message format from the API into an object such that
// {<backendFieldID>: <errorMessage>}

export class ErrorMessagesType {
  [key: string]: string;
}

export function mapErrorMessages(err): ErrorMessagesType {
  const messages = {};
  const { data } = err.response;

  // 500 errors only have err.response.data string
  if (typeof data === 'string') {
    messages['__nofield'] = err.response.data;
    return messages;
  }

  // errors can come in several flavors depending on if the API is from
  // pulp or anible.
  // Galaxy error:
  // {
  //   "errors": [
  //     {
  //       "status": "400",
  //       "code": "invalid",
  //       "title": "<short_message>",
  //       "detail": "<long_message>",
  //       "source": {
  //         "parameter": "<field_name>"
  //       }
  //     }
  //   ]
  // }
  // Pulp error:
  // {
  //   "<field_name>": "<error_message>",
  // }

  // handle galaxy error
  if ('errors' in data && Array.isArray(data['errors'])) {
    for (const e of err.response.data.errors) {
      if (e.source) {
        messages[e.source.parameter] = e.detail;
      } else {
        // some error responses are too cool to have a
        // parameter set on them >:(
        messages['__nofield'] = e.detail || e.title;
      }
    }

    return messages;
  }

  // handle pulp error
  if (typeof data === 'object') {
    return data;
  }

  return {};
}
