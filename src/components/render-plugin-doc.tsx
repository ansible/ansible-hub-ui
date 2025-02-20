import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { Table, Tbody, Td, Th, Tr } from '@patternfly/react-table';
import { dom, parse } from 'antsibull-docs';
import { Component, Fragment, type ReactElement, type ReactNode } from 'react';
import {
  type PluginContentType,
  type PluginDoc,
  type PluginOption,
  type ReturnedValue,
} from 'src/api';
import { ExternalLink } from 'src/components';
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
    text: ReactNode | undefined,
  ) => ReactElement;
  renderDocLink: (name: string, href: string) => ReactElement;
  renderTableOfContentsLink: (title: string, section: string) => ReactElement;
  renderWarning: (text: string) => ReactElement;
}

const Choice = ({ c }: { c: string | Record<string, string> }) => (
  <pre style={{ display: 'inline-block', padding: '2px 4px' }}>
    {typeof c === 'object' ? JSON.stringify(c, null, 2) : c}
  </pre>
);

const Legend = ({ children }: { children: ReactNode }) => (
  <div style={{ display: 'inline-block', verticalAlign: 'top' }}>
    {children}
  </div>
);

export class RenderPluginDoc extends Component<IProps, IState> {
  subOptionsMaxDepth: number;
  returnContainMaxDepth: number;

  constructor(props) {
    super(props);
    this.state = {
      renderError: false,
    };
  }

  componentDidCatch(error) {
    console.log('RenderPluginDoc did catch', error);
    this.setState({ renderError: true });
  }

  componentDidUpdate(prevProps) {
    if (this.state.renderError && this.props.plugin !== prevProps.plugin) {
      this.setState({ renderError: false });
    }
  }

  render() {
    const { plugin } = this.props;

    if (this.state.renderError) {
      return this.renderError(plugin);
    }

    // componentDidCatch doesn't seem to be able to catch errors that
    // are thrown outside of return(), so we'll wrap everything in a
    // try just in case
    let content;
    try {
      const doc: PluginDoc = this.parseDocString(plugin);
      const example: string = this.parseExamples(plugin);
      const returnVals: ReturnedValue[] = this.parseReturn(plugin);
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
    } catch (error) {
      console.log('RenderPluginDoc render catch', error);
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
  }

  private renderError(plugin) {
    // There's a good chance that something about the plugin doc data will
    // be malformed since it isn't validated. When that hapens, show an
    // error instead of crashing the whole app
    return (
      <>
        {this.props.renderWarning(
          t`Documentation Syntax Error: cannot parse plugin documention.`,
        )}
        <br />
        <div>
          {plugin.content_type && plugin.content_name ? (
            <h1>
              {plugin.content_type} &gt; {plugin.content_name}
            </h1>
          ) : null}
          <p>
            <Trans>
              The documentation object for this plugin seems to contain invalid
              syntax that makes it impossible for Automation Hub to parse. You
              can still look at the unformatted documentation object bellow if
              you need to.
            </Trans>
          </p>

          <h2>{t`Unformatted Documentation`}</h2>

          <pre className='hub-doc-plugin-raw'>
            {JSON.stringify(plugin, null, 2)}
          </pre>
        </div>
      </>
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
    // TODO: make the return string match the desired output as closely as possible

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
        // Description is expected to be an array of strings. If its not, do what we can to make it one
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

  private formatPartError(part: dom.ErrorPart): ReactNode {
    return (
      <span className='error'>{t`ERROR while parsing: ${part.message}`}</span>
    );
  }

  private formatPartBold(part: dom.BoldPart): ReactNode {
    return <b>{part.text}</b>;
  }

  private formatPartCode(part: dom.CodePart): ReactNode {
    return <span className='hub-doc-inline-code'>{part.text}</span>;
  }

  private formatPartHorizontalLine(_part: dom.HorizontalLinePart): ReactNode {
    return <hr />;
  }

  private formatPartItalic(part: dom.ItalicPart): ReactNode {
    return <i>{part.text}</i>;
  }

  private formatPartLink(part: dom.LinkPart): ReactNode {
    return this.props.renderDocLink(part.text, part.url);
  }

  private formatPartModule(part: dom.ModulePart): ReactNode {
    return this.props.renderPluginLink(part.fqcn, 'module', undefined);
  }

  private formatPartRstRef(part: dom.RSTRefPart): ReactNode {
    return part.text;
  }

  private formatPartURL(part: dom.URLPart): ReactNode {
    return <ExternalLink href={part.url}>{part.url}</ExternalLink>;
  }

  private formatPartText(part: dom.TextPart): ReactNode {
    return part.text;
  }

  private formatPartEnvVariable(part: dom.EnvVariablePart): ReactNode {
    return <span className='hub-doc-inline-code'>{part.name}</span>;
  }

  private formatPartOptionNameReturnValue(
    part: dom.OptionNamePart | dom.ReturnValuePart,
  ): ReactNode {
    const content =
      part.value === undefined ? (
        <span className='hub-doc-inline-code'>
          <b>{part.name}</b>
        </span>
      ) : (
        <span className='hub-doc-inline-code'>
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

  private formatPartOptionValue(part: dom.OptionValuePart): ReactNode {
    return <span className='hub-doc-inline-code'>{part.value}</span>;
  }

  private formatPartPlugin(part: dom.PluginPart): ReactNode {
    return this.props.renderPluginLink(
      part.plugin.fqcn,
      part.plugin.type,
      undefined,
    );
  }

  private formatPart(part: dom.Part): ReactNode {
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

  private applyDocFormatters(text: string): ReactNode {
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
          <Fragment key={i}>{x}</Fragment>
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
      <>
        <h2>{t`DEPRECATED`}</h2>
        {deprecated.removed_in ? (
          <div>
            <Trans>
              <b>Removed in version</b> {doc.deprecated.removed_in}
            </Trans>
          </div>
        ) : null}

        <div>
          <b>{t`Why:`}</b>{' '}
          {deprecated.why ? doc.deprecated.why : t`No reason specified.`}
        </div>

        <div>
          <b>{t`Alternative:`}</b>{' '}
          {deprecated.alternative
            ? doc.deprecated.alternative
            : t`No alternatives specified.`}
        </div>
      </>
    );
  }

  private renderTableOfContents(content) {
    return (
      <ul>
        {content['synopsis'] !== null && (
          <li>
            {this.props.renderTableOfContentsLink(t`Synopsis`, 'synopsis')}
          </li>
        )}
        {content['parameters'] !== null && (
          <li>
            {this.props.renderTableOfContentsLink(t`Parameters`, 'parameters')}
          </li>
        )}
        {content['notes'] !== null && (
          <li>{this.props.renderTableOfContentsLink(t`Notes`, 'notes')}</li>
        )}
        {content['examples'] !== null && (
          <li>
            {this.props.renderTableOfContentsLink(t`Examples`, 'examples')}
          </li>
        )}
        {content['returnValues'] !== null && (
          <li>
            {this.props.renderTableOfContentsLink(
              t`Return Values`,
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
      <>
        <h2 id='synopsis'>{t`Synopsis`}</h2>
        <ul>
          {doc.description.map((d, i) => (
            <li key={i}>{this.applyDocFormatters(d)}</li>
          ))}
        </ul>
      </>
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

    // FIXME table 2 flex
    return (
      <>
        <h2 id='parameters'>{t`Parameters`}</h2>
        <Table className='hub-doc-options-table'>
          <Tbody>
            <Tr>
              <Th colSpan={maxDepth + 1}>{t`Parameter`}</Th>
              <Th>
                {t`Choices`} /{' '}
                <span className='hub-doc-blue'>{t`Defaults`}</span>
              </Th>
              {content_type !== 'module' ? <Th>{t`Configuration`}</Th> : null}
              <Th>{t`Comments`}</Th>
            </Tr>
            {
              // TODO: add support for sub options. Example:
              //https://github.com/ansible/ansible/blob/devel/lib/ansible/modules/network/fortios/fortios_dlp_fp_doc_source.py#L93}
              // TODO: do we need to display version added?
            }
            {paramEntries}
          </Tbody>
        </Table>
      </>
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
        spacers.push(<Td key={x} className='spacer' />);
      }
      output.push(
        <Tr key={key}>
          {
            // PARAMETER --------------------------------
          }
          {spacers}
          <Td
            colSpan={maxDepth + 1 - depth}
            className={option.suboptions ? 'parent' : ''}
          >
            <span className='hub-doc-option-name'>{option.name}</span>
            <small>
              {this.documentedType(option['type'])}
              {option['elements'] ? (
                <span>
                  {' '}
                  / {t`elements`}={this.documentedType(option['elements'])}
                </span>
              ) : null}
              {option['required'] ? (
                <span>
                  {' '}
                  / <span className='hub-doc-red'>{t`required`}</span>
                </span>
              ) : null}
            </small>
          </Td>
          {
            // CHOICES -------------------------------
          }
          <Td>{this.renderChoices(option)}</Td>
          {
            // CONFIGURATION (non module only) -------
          }
          {content_type !== 'module' ? (
            <Td>{this.renderPluginConfiguration(option)}</Td>
          ) : null}
          {
            // COMMENTS ------------------------------
          }
          <Td>
            {option.description.map((d, i) => (
              <p key={i}>{this.applyDocFormatters(d)}</p>
            ))}

            {option['aliases'] ? (
              <small>
                <span className='hub-doc-green'>
                  {t`aliases`}: {option['aliases'].join(', ')}
                </span>
              </small>
            ) : null}
          </Td>
        </Tr>,
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
      <>
        {option['ini'] ? (
          <div className='hub-doc-plugin-config'>
            {t`ini entries:`}
            {option['ini'].map((v, i) => (
              <p key={i}>
                [{v.section}]<br />
                {v.key} = {v.default ? v.default : t`VALUE`}
              </p>
            ))}
          </div>
        ) : null}

        {option['env'] ? (
          <div className='hub-doc-plugin-config'>
            {option['env'].map((v, i) => (
              <div key={i}>
                {t`env`}: {v.name}
              </div>
            ))}
          </div>
        ) : null}

        {option['vars'] ? (
          <div className='hub-doc-plugin-config'>
            {option['vars'].map((v, i) => (
              <div key={i}>
                {t`var`}: {v.name}
              </div>
            ))}
          </div>
        ) : null}
      </>
    );
  }

  private renderLegend(legend) {
    if (!legend) {
      return null;
    }

    if (!Array.isArray(legend)) {
      legend = [legend];
    }

    return (
      <>
        {': '}
        <Legend>
          {legend.map((d, i) => (
            <>
              {i ? <br /> : null}
              {this.applyDocFormatters(d)}
            </>
          ))}
        </Legend>
      </>
    );
  }

  private renderChoices(option) {
    let choices,
      defaultChoice,
      legends = {};

    if (option['type'] === 'bool' || option['type'] === 'boolean') {
      choices = ['true', 'false'];

      if (option['default'] === true) {
        defaultChoice = 'true';
      } else if (option['default'] === false) {
        defaultChoice = 'false';
      }
    } else {
      choices = option['choices'] || [];
      defaultChoice = option['default'];
    }

    // allow multistring values to wrap
    if (defaultChoice?.[0] === '[') {
      defaultChoice = defaultChoice.replaceAll('","', '", "');
    }

    if (typeof choices === 'object' && !Array.isArray(choices)) {
      legends = choices;
      choices = Object.keys(choices);
    }

    return (
      <>
        {choices && Array.isArray(choices) && choices.length !== 0 ? (
          <div>
            <span className='hub-doc-option-name'>{t`Choices:`}</span>{' '}
            <ul>
              {choices.map((c, i) => (
                <li key={i}>
                  {c === defaultChoice ? (
                    <span className='hub-doc-blue' title={t`default`}>
                      <Choice c={c} /> &nbsp;&larr;
                    </span>
                  ) : (
                    <Choice c={c} />
                  )}
                  {this.renderLegend(legends[c])}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {defaultChoice !== undefined && !choices.includes(defaultChoice) ? (
          <span>
            <span className='hub-doc-option-name'>{t`Default:`}</span>{' '}
            <span className='hub-doc-blue'>{defaultChoice}</span>
          </span>
        ) : null}
      </>
    );
  }

  private renderNotes(doc: PluginDoc) {
    if (!doc.notes) {
      return null;
    }

    return (
      <>
        <h2 id='notes'>{t`Notes`}</h2>
        <ul>
          {doc.notes.map((note, i) => (
            <li key={i}>{this.applyDocFormatters(note)}</li>
          ))}
        </ul>
      </>
    );
  }

  private renderRequirements(doc: PluginDoc) {
    if (!doc.requirements) {
      return null;
    }

    return (
      <>
        <h2>{t`Requirements`}</h2>
        <ul>
          {doc.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </>
    );
  }

  private renderExample(example: string) {
    if (!example) {
      return null;
    }

    return (
      <>
        <h2 id='examples'>{t`Examples`}</h2>
        <pre>{example}</pre>
      </>
    );
  }

  private renderReturnValues(returnV: ReturnedValue[], maxDepth: number) {
    if (!returnV) {
      return null;
    }

    // FIXME table 2 flex
    return (
      <>
        <h2 id='return-values'>{t`Return Values`}</h2>
        <Table className='hub-doc-options-table'>
          <Tbody>
            <Tr>
              <Th colSpan={maxDepth + 1}>{t`Key`}</Th>
              <Th>{t`Returned`}</Th>
              <Th>{t`Description`}</Th>
            </Tr>
            {this.renderReturnValueEntries(returnV, 0, maxDepth, '')}
          </Tbody>
        </Table>
      </>
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
        spacers.push(<Td key={x} colSpan={1} className='spacer' />);
      }

      const key = `${parent}-${option.name}`;
      entries.push(
        <Tr key={key}>
          {spacers}
          <Td
            colSpan={maxDepth + 1 - depth}
            className={option.contains ? 'parent' : ''}
          >
            {option.name} <br /> ({option.type})
          </Td>
          <Td>{option.returned}</Td>
          <Td>
            {option.description.map((d, i) => (
              <p key={i}>{this.applyDocFormatters(d)}</p>
            ))}

            {option.sample ? (
              <div>
                <br />
                {t`sample:`}{' '}
                {typeof option.sample === 'string' ? (
                  option.sample
                ) : (
                  <pre>{JSON.stringify(option.sample, null, 2)}</pre>
                )}
              </div>
            ) : null}
          </Td>
        </Tr>,
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
