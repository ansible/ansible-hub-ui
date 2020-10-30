// Transforms the error message format from the API into an object such that
// {<backendFieldID>: <errorMessage>}

export function mapErrorMessages(err) {
  const messages: any = {};
  for (const e of err.response.data.errors) {
    if (e.source) {
      messages[e.source.parameter] = e.detail;
    } else {
      // some error responses are too cool to have a
      // parameter set on them >:(
      messages['__nofield'] = e.detail;
    }
  }
  return messages;
}
