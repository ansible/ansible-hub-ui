import { dom, parse } from 'antsibull-docs';
import * as React from 'react';
import {
  PluginContentType,
  PluginDoc,
  PluginOption,
  ReturnedValue,
} from 'src/api';
import './render-plugin-doc.scss';

// Documentation for module doc string spec
// https://docs.ansible.com/ansible/latest/dev_guide/developing_modules_documenting.html

interface IState {
  renderError: boolean;
}

interface IProps {
  plugin: PluginContentType;

  renderPluginLink: (
    pluginName: string,
    pluginType: string,
    text: React.ReactNode | undefined,
  ) => React.ReactElement;
  renderDocLink: (name: string, href: string) => React.ReactElement;
  renderTableOfContentsLink: (
    title: string,
    section: string,
  ) => React.ReactElement;
  renderWarning: (text: string) => React.ReactElement;
}

export class RenderPluginDoc extends React.Component<IProps, IState> {
  subOptionsMaxDepth: number;
  returnContainMaxDepth: number;

  constructor(props) {
    super(props);
    this.state = {
      renderError: false,
    };
  }

  componentDidCatch(error) {
    console.log(error);
    this.setState({ renderError: true });
  }

  render() {
    const { plugin } = this.props;

    if (!this.state.renderError) {
      // componentDidCatch doesn't seem to be able to catch errors that
      // are thrown outside of return(), so we'll wrap everything in a
      // try just in case
      let doc: PluginDoc;
      let example: string;
      let returnVals: ReturnedValue[];
      let content;
      try {
        doc = this.parseDocString(plugin);
        example = this.parseExamples(plugin);
        returnVals = this.parseReturn(plugin);
        content = {
          synopsis: this.renderSynopsis(doc),
          parameters: this.renderParameters(
            doc.options,
            plugin.content_type,
            this.subOptionsMaxDepth,
          ),
          notes: this.renderNotes(doc),
          examples: this.renderExample(example),
          returnValues: this.renderReturnValues(
            returnVals,
            this.returnContainMaxDepth,
          ),
          shortDescription: this.renderShortDescription(doc),
          deprecated: this.renderDeprecated(doc, plugin.content_name),
          requirements: this.renderRequirements(doc),
        };
      } catch (err) {
        console.log(err);
        return this.renderError(plugin);
      }

      return (
        <div>
          <h1>
            {plugin.content_type} &gt; {plugin.content_name}
          </h1>
          <br />
          {content.shortDescription}
          {content.deprecated}
          {this.renderTableOfContents(content)}
          {content.synopsis}
          {content.requirements}
          {content.parameters}
          {content.notes}
          {content.examples}
          {content.returnValues}
        </div>
      );
    } else {
      return this.renderError(plugin);
    }
  }

  private renderError(plugin) {
    // There's a good chance that something about the plugin doc data will
    // be malformed since it isn't validated. When that hapens, show an
    // error instead of crashing the whole app
    return (
      <React.Fragment>
        {this.props.renderWarning(
          'Documentation Syntax Error: cannot parse plugin documention.',
        )}
        <br />
        <div>
          {plugin.content_type && plugin.content_name ? (
            <h1>
              {plugin.content_type} &gt; {plugin.content_name}
            </h1>
          ) : null}
          <p>
            The documentation object for this plugin seems to contain invalid
            syntax that makes it impossible for Automation Hub to parse. You can
            still look at the unformatted documentation object bellow if you
            need to.
          </p>

          <h2>Unformatted Documentation</h2>

          <pre className='plugin-raw'>{JSON.stringify(plugin, null, 2)}</pre>
        </div>
      </React.Fragment>
    );
  }

  private parseDocString(plugin: PluginContentType): PluginDoc {
    // TODO: if the parser can't figure out what to do with the object
    // passed to it, it should throw an error that can be displayed to the
    // user with the piece of the documention that's broken.

    // TODO: make the doc string match the desired output as closely as
    // possible
    if (!plugin.doc_strings) {
      return { description: [], short_description: '' } as PluginDoc;
    }

    const doc: PluginDoc = { ...plugin.doc_strings.doc };

    let maxDepth = 0;

    const parseOptions = (options: PluginOption[], depth) => {
      if (depth > maxDepth) {
        maxDepth = depth;
      }
      for (const op of options) {
        // Description is expected to be an array of strings. If its not,
        // do what we can to make it one
        op.description = this.ensureListofStrings(op.description);

        if (typeof op.default === 'object') {
          op.default = JSON.stringify(op.default);
        }

        // recursively parse sub options
        if (op.suboptions) {
          parseOptions(op.suboptions, depth + 1);
        }
      }
    };

    if (doc.options) {
      parseOptions(doc.options, 0);
    }

    doc.description = this.ensureListofStrings(doc.description);
    this.subOptionsMaxDepth = maxDepth;

    return doc;
  }

  private parseExamples(plugin: PluginContentType): string {
    if (!plugin.doc_strings) {
      return null;
    }

    if (typeof plugin.doc_strings.examples === 'string') {
      // the examples always seem to have an annoying new line at the top
      // so just replace it here if it exists.
      return plugin.doc_strings.examples.replace('\n', '');
    } else {
      return null;
    }
  }

  private parseReturn(plugin: PluginContentType): ReturnedValue[] {
    // TODO: make the return string match the desired output as closely as
    // possible

    if (!plugin.doc_strings) {
      return null;
    }

    if (!plugin.doc_strings.return) {
      return null;
    }

    let maxDepth = 0;

    const parseReturnRecursive = (returnV: ReturnedValue[], depth) => {
      if (depth > maxDepth) {
        maxDepth = depth;
      }
      for (const ret of returnV) {
        // Description is expected to be an array of strings. If its not,
        // do what we can to make it one
        ret.description = this.ensureListofStrings(ret.description);

        // recursively parse sub options
        if (ret.contains) {
          parseReturnRecursive(ret.contains, depth + 1);
        }
      }
    };

    const returnValues = [...plugin.doc_strings.return];
    parseReturnRecursive(returnValues, 0);
    this.returnContainMaxDepth = maxDepth;

    return returnValues;
  }

  private formatPartError(part: dom.ErrorPart): React.ReactNode {
    return <span className='error'>ERROR while parsing: {part.message}</span>;
  }

  private formatPartBold(part: dom.BoldPart): React.ReactNode {
    return <b>{part.text}</b>;
  }

  private formatPartCode(part: dom.CodePart): React.ReactNode {
    return <span className='inline-code'>{part.text}</span>;
  }

  private formatPartHorizontalLine(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    part: dom.HorizontalLinePart,
  ): React.ReactNode {
    return <hr />;
  }

  private formatPartItalic(part: dom.ItalicPart): React.ReactNode {
    return <i>{part.text}</i>;
  }

  private formatPartLink(part: dom.LinkPart): React.ReactNode {
    return this.props.renderDocLink(part.text, part.url);
  }

  private formatPartModule(part: dom.ModulePart): React.ReactNode {
    return this.props.renderPluginLink(part.fqcn, 'module', undefined);
  }

  private formatPartRstRef(part: dom.RSTRefPart): React.ReactNode {
    return part.text;
  }

  private formatPartURL(part: dom.URLPart): React.ReactNode {
    return (
      <a href={part.url} target='_blank' rel='noreferrer'>
        {part.url}
      </a>
    );
  }

  private formatPartText(part: dom.TextPart): React.ReactNode {
    return part.text;
  }

  private formatPartEnvVariable(part: dom.EnvVariablePart): React.ReactNode {
    return <span className='inline-code'>{part.name}</span>;
  }

  private formatPartOptionNameReturnValue(
    part: dom.OptionNamePart | dom.ReturnValuePart,
  ): React.ReactNode {
    const content =
      part.value === undefined ? (
        <span className='inline-code'>
          <b>{part.name}</b>
        </span>
      ) : (
        <span className='inline-code'>
          {part.name}={part.value}
        </span>
      );
    if (!part.plugin) {
      return content;
    }
    return this.props.renderPluginLink(
      part.plugin.fqcn,
      part.plugin.type,
      content,
    );
  }

  private formatPartOptionValue(part: dom.OptionValuePart): React.ReactNode {
    return <span className='inline-code'>{part.value}</span>;
  }

  private formatPartPlugin(part: dom.PluginPart): React.ReactNode {
    return this.props.renderPluginLink(
      part.plugin.fqcn,
      part.plugin.type,
      undefined,
    );
  }

  private formatPart(part: dom.Part): React.ReactNode {
    switch (part.type) {
      case dom.PartType.ERROR:
        return this.formatPartError(part as dom.ErrorPart);
      case dom.PartType.BOLD:
        return this.formatPartBold(part as dom.BoldPart);
      case dom.PartType.CODE:
        return this.formatPartCode(part as dom.CodePart);
      case dom.PartType.HORIZONTAL_LINE:
        return this.formatPartHorizontalLine(part as dom.HorizontalLinePart);
      case dom.PartType.ITALIC:
        return this.formatPartItalic(part as dom.ItalicPart);
      case dom.PartType.LINK:
        return this.formatPartLink(part as dom.LinkPart);
      case dom.PartType.MODULE:
        return this.formatPartModule(part as dom.ModulePart);
      case dom.PartType.RST_REF:
        return this.formatPartRstRef(part as dom.RSTRefPart);
      case dom.PartType.URL:
        return this.formatPartURL(part as dom.URLPart);
      case dom.PartType.TEXT:
        return this.formatPartText(part as dom.TextPart);
      case dom.PartType.ENV_VARIABLE:
        return this.formatPartEnvVariable(part as dom.EnvVariablePart);
      case dom.PartType.OPTION_NAME:
        return this.formatPartOptionNameReturnValue(part as dom.OptionNamePart);
      case dom.PartType.OPTION_VALUE:
        return this.formatPartOptionValue(part as dom.OptionValuePart);
      case dom.PartType.PLUGIN:
        return this.formatPartPlugin(part as dom.PluginPart);
      case dom.PartType.RETURN_VALUE:
        return this.formatPartOptionNameReturnValue(
          part as dom.ReturnValuePart,
        );
    }
  }

  private applyDocFormatters(text: string): React.ReactNode {
    // TODO: pass current plugin's type and name, and (if role) the current entrypoint as well
    const parsed = parse(text);

    // Special case: result is a single paragraph consisting of a single text part
    if (
      parsed.length === 1 &&
      parsed[0].length === 1 &&
      parsed[0][0].type === dom.PartType.TEXT
    ) {
      return <span>{parsed[0][0].text}</span>;
    }

    const fragments = [];
    for (const paragraph of parsed) {
      for (const part of paragraph) {
        fragments.push(this.formatPart(part));
      }
    }
    return (
      <span>
        {fragments.map((x, i) => (
          <React.Fragment key={i}>{x}</React.Fragment>
        ))}
      </span>
    );
  }

  private ensureListofStrings(v) {
    if (typeof v === 'string') {
      return [v];
    } else if (!v) {
      return [];
    } else {
      return v;
    }
  }

  private renderDeprecated(doc: PluginDoc, _pluginName: string) {
    const isDeprecated = doc.deprecated;

    if (!isDeprecated) {
      return null;
    }

    const deprecated = doc.deprecated || {};

    return (
      <React.Fragment>
        <h2>DEPRECATED</h2>
        {deprecated.removed_in ? (
          <div>
            <b>Removed in version</b> {doc.deprecated.removed_in}
          </div>
        ) : null}

        <div>
          <b>Why: </b>
          {deprecated.why ? doc.deprecated.why : 'No reason specified.'}
        </div>

        <div>
          <b>Alternative: </b>
          {deprecated.alternative
            ? doc.deprecated.alternative
            : 'No alternatives specified.'}
        </div>
      </React.Fragment>
    );
  }

  private renderTableOfContents(content) {
    // return this.props.renderTableOfContentsLink('Synopsis', 'synopsis');

    return (
      <ul>
        {content['synopsis'] !== null && (
          <li>
            {this.props.renderTableOfContentsLink('Synopsis', 'synopsis')}
          </li>
        )}
        {content['parameters'] !== null && (
          <li>
            {this.props.renderTableOfContentsLink('Parameters', 'parameters')}
          </li>
        )}
        {content['notes'] !== null && (
          <li>{this.props.renderTableOfContentsLink('Notes', 'notes')}</li>
        )}
        {content['examples'] !== null && (
          <li>
            {this.props.renderTableOfContentsLink('Examples', 'examples')}
          </li>
        )}
        {content['returnValues'] !== null && (
          <li>
            {this.props.renderTableOfContentsLink(
              'Return Values',
              'return-values',
            )}
          </li>
        )}
      </ul>
    );
  }

  private renderShortDescription(doc: PluginDoc) {
    return <div>{doc.short_description}</div>;
  }

  private renderSynopsis(doc: PluginDoc) {
    return (
      <React.Fragment>
        <h2 id='synopsis'>Synopsis</h2>
        <ul>
          {doc.description.map((d, i) => (
            <li key={i}>{this.applyDocFormatters(d)}</li>
          ))}
        </ul>
      </React.Fragment>
    );
  }

  private renderParameters(
    parameters: PluginOption[],
    content_type: string,
    maxDepth: number,
  ) {
    if (!parameters) {
      return null;
    }

    // render the entries first,
    const paramEntries = this.renderParameterEntries(
      parameters,
      content_type,
      0,
      maxDepth,
      '',
    );

    return (
      <React.Fragment>
        <h2 id='parameters'>Parameters</h2>
        <table className='options-table'>
          <tbody>
            <tr>
              <th colSpan={maxDepth + 1}>Parameter</th>
              <th>
                Choices/
                <span className='blue'>Defaults</span>
              </th>
              {content_type !== 'module' ? <th>Configuration</th> : null}
              <th>Comments</th>
            </tr>
            {
              // TODO: add support for sub options. Example:
              //https://github.com/ansible/ansible/blob/devel/lib/ansible/modules/network/fortios/fortios_dlp_fp_doc_source.py#L93}
              // TODO: do we need to display version added?
            }
            {paramEntries}
          </tbody>
        </table>
      </React.Fragment>
    );
  }

  private renderParameterEntries(
    parameters: PluginOption[],
    content_type: string,
    depth: number,
    maxDepth: number,
    parent: string,
  ) {
    let output = [];
    parameters.forEach((option) => {
      const spacers = [];
      const key = `${parent}-${option.name}`;
      for (let x = 0; x < depth; x++) {
        spacers.push(<td key={x} className='spacer' />);
      }
      output.push(
        <tr key={key}>
          {
            // PARAMETER --------------------------------
          }
          {spacers}
          <td
            colSpan={maxDepth + 1 - depth}
            className={option.suboptions ? 'parent' : ''}
          >
            <span className='option-name'>{option.name}</span>
            <small>
              {this.documentedType(option['type'])}
              {option['elements'] ? (
                <span>
                  {' '}
                  / elements ={this.documentedType(option['elements'])}
                </span>
              ) : null}
              {option['required'] ? (
                <span>
                  {' '}
                  / <span className='red'>required</span>
                </span>
              ) : null}
            </small>
          </td>
          {
            // CHOICES -------------------------------
          }
          <td>{this.renderChoices(option)}</td>
          {
            // CONFIGURATION (non module only) -------
          }
          {content_type !== 'module' ? (
            <td>{this.renderPluginConfiguration(option)}</td>
          ) : null}
          {
            // COMMENTS ------------------------------
          }
          <td>
            {option.description.map((d, i) => (
              <p key={i}>{this.applyDocFormatters(d)}</p>
            ))}

            {option['aliases'] ? (
              <small>
                <span className='green'>
                  aliases: {option['aliases'].join(', ')}
                </span>
              </small>
            ) : null}
          </td>
        </tr>,
      );

      // recursively render sub options
      if (option.suboptions) {
        output = output.concat(
          this.renderParameterEntries(
            option.suboptions,
            content_type,
            depth + 1,
            maxDepth,
            key,
          ),
        );
      }
    });

    return output;
  }

  private renderPluginConfiguration(option) {
    return (
      <React.Fragment>
        {option['ini'] ? (
          <div className='plugin-config'>
            ini entries:
            {option['ini'].map((v, i) => (
              <p key={i}>
                [{v.section}]<br />
                {v.key} = {v.default ? v.default : 'VALUE'}
              </p>
            ))}
          </div>
        ) : null}

        {option['env'] ? (
          <div className='plugin-config'>
            {option['env'].map((v, i) => (
              <div key={i}>env: {v.name}</div>
            ))}
          </div>
        ) : null}

        {option['vars'] ? (
          <div className='plugin-config'>
            {option['vars'].map((v, i) => (
              <div key={i}>var: {v.name}</div>
            ))}
          </div>
        ) : null}
      </React.Fragment>
    );
  }

  private renderChoices(option) {
    let choices, defaul;

    if (option['type'] === 'bool') {
      choices = ['true', 'false'];
      if (option['default'] === true) {
        defaul = 'true';
      } else if (option['default'] === false) {
        defaul = 'false';
      }
    } else {
      choices = option['choices'] || [];
      defaul = option['default'];
    }

    return (
      <React.Fragment>
        {choices && Array.isArray(choices) && choices.length !== 0 ? (
          <div>
            <span className='option-name'>Choices: </span>
            <ul>
              {choices.map((c, i) => (
                <li key={i}>
                  {c === defaul ? (
                    <span className='blue'>{c} &nbsp;&larr;</span>
                  ) : (
                    c
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {defaul && !choices.includes(defaul) ? (
          <span>
            <span className='option-name'>Default: </span>
            <span className='blue'>{defaul}</span>
          </span>
        ) : null}
      </React.Fragment>
    );
  }

  private renderNotes(doc: PluginDoc) {
    if (!doc.notes) {
      return null;
    }

    return (
      <React.Fragment>
        <h2 id='notes'>Notes</h2>
        <ul>
          {doc.notes.map((note, i) => (
            <li key={i}>{this.applyDocFormatters(note)}</li>
          ))}
        </ul>
      </React.Fragment>
    );
  }

  private renderRequirements(doc: PluginDoc) {
    if (!doc.requirements) {
      return null;
    }

    return (
      <React.Fragment>
        <h2>Requirements</h2>
        <ul>
          {doc.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </React.Fragment>
    );
  }

  private renderExample(example: string) {
    if (!example) {
      return null;
    }
    return (
      <React.Fragment>
        <h2 id='examples'>Examples</h2>
        <pre>{example}</pre>
      </React.Fragment>
    );
  }

  private renderReturnValues(returnV: ReturnedValue[], maxDepth: number) {
    if (!returnV) {
      return null;
    }
    return (
      <React.Fragment>
        <h2 id='return-values'>Return Values</h2>
        <table className='options-table'>
          <tbody>
            <tr>
              <th colSpan={maxDepth + 1}>Key</th>
              <th>Returned</th>
              <th>Description</th>
            </tr>
            {this.renderReturnValueEntries(returnV, 0, maxDepth, '')}
          </tbody>
        </table>
      </React.Fragment>
    );
  }

  private renderReturnValueEntries(
    returnValues: ReturnedValue[],
    depth: number,
    maxDepth: number,
    parent: string,
  ) {
    let entries = [];

    returnValues.forEach((option) => {
      const spacers = [];
      for (let x = 0; x < depth; x++) {
        spacers.push(<td key={x} colSpan={1} className='spacer' />);
      }
      const key = `${parent}-${option.name}`;
      entries.push(
        <tr key={key}>
          {spacers}
          <td
            colSpan={maxDepth + 1 - depth}
            className={option.contains ? 'parent' : ''}
          >
            {option.name} <br /> ({option.type})
          </td>
          <td>{option.returned}</td>
          <td>
            {option.description.map((d, i) => (
              <p key={i}>{this.applyDocFormatters(d)}</p>
            ))}

            {option.sample ? (
              <div>
                <br />
                sample:
                {typeof option.sample === 'string' ? (
                  option.sample
                ) : (
                  <pre>{JSON.stringify(option.sample, null, 2)}</pre>
                )}
              </div>
            ) : null}
          </td>
        </tr>,
      );

      if (option.contains) {
        entries = entries.concat(
          // recursively render values
          this.renderReturnValueEntries(
            option.contains,
            depth + 1,
            maxDepth,
            key,
          ),
        );
      }
    });
    return entries;
  }

  // https://github.com/ansible/ansible/blob/1b8aa798df6f6fa96ba5ea2a9dbf01b3f1de555c/hacking/build_library/build_ansible/jinja2/filters.py#L53
  private documentedType(text) {
    switch (text) {
      case 'str':
        return 'string';
      case 'bool':
        return 'boolean';
      case 'int':
        return 'integer';
      case 'dict':
        return 'dictionary';
      case undefined:
        return '-';
      default:
        return text;
    }
  }
}
