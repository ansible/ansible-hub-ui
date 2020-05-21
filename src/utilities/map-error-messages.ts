// Transforms the error message format from the API into an object such that
// {<backendFieldID>: <errorMessage>}

export function mapErrorMessages(err) {
  const messages: any = {};
  for (const e of err.response.data.errors) {
    messages[e.source.parameter] = e.detail;
  }
  return messages;
}
