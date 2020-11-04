const CommandParser = {
  parse: function (str) {
    const match = str.match(/^(\S+)(?:\s*|\s+(.+))?$/);

    return {
      arg0: match[1],
      rest: match[2],
      input: str,
    };
  },
};

export class Commando {
  constructor (commands) {
    this.commands = commands;
  }

  async unknown (command) {
    return {
      class: "error",
      text : `Command ${command.arg0} is unknown.`,
      command
    }
  }

  async execute (command) {
    const handler = this.commands[command.arg0];

    if (! handler) return this.unknown(command);

    const result = await handler(command);

    return result;
  }
}

class OutputDevice {
  constructor (el) {
    this.el = el;
  }

  buildPlaceHolder (command) {
    const output = document.createElement('div');
    output.classList.add('unit');

    const status = document.createElement('div');
    status.classList.add('status');
    const body   = document.createElement('div');
    body.classList.add('body');
    body.classList.add('loading');

    status.appendChild( document.createTextNode("…") );
    status.setAttribute('title', command.input);

    body.appendChild( document.createTextNode("...") );

    output.appendChild(status);
    output.appendChild(body);

    return output;
  }

  buildOutputUnit (spec, command) {
    const output = document.createElement('div');
    output.classList.add('unit');

    const status = document.createElement('div');
    status.classList.add('status');
    const body   = document.createElement('div');
    body.classList.add('body');

    if (spec.class) body.classList.add(spec.class);

    status.appendChild( document.createTextNode("⦻") );
    status.setAttribute('title', command.input);

    body.appendChild( document.createTextNode(spec.text));

    output.appendChild(status);
    output.appendChild(body);

    return output;
  }

  async showResult (result, arg) {
    const ph = this.buildPlaceHolder(arg.command);
    this.el.appendChild(ph);
    this.el.scrollTo({
      top: this.el.scrollHeight,
      behavior: 'smooth',
    });

    const output = this.buildOutputUnit(await result, arg.command);
    ph.replaceWith(output);
  }
}

export function Terminal ({ commando, input: inputEl, output: outputEl }) {
  const output = new OutputDevice(outputEl);

  this.input  = inputEl;
  this.output = output;

  this.input.addEventListener('keyup', async function (event) {
    if (event.key !== 'Enter') return;

    const text = this.value;

    if (text.length === 0) return;

    this.value = "";

    const command = CommandParser.parse(text);
    const result  = commando.execute(command);

    output.showResult(result, { command });
  });
}
