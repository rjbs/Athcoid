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

export function Commando (commands) {
  this.commands = commands;
}

Commando.prototype = {
  unknown: function (command) {
    return {
      class: "error",
      text : `Command ${command.arg0} is unknown.`,
      command
    }
  },
  execute: function (command) {
    const handler = this.commands[command.arg0];

    if (! handler) return this.unknown(command);

    const result = handler(command);
    result.command = command;

    return result;
  },
  commands: { },
};

function OutputDevice (el) {
  this.el = el;
}

OutputDevice.prototype = {
  buildOutputUnit: function (spec) {
    const output = document.createElement('div');
    output.classList.add('unit');

    const status = document.createElement('div');
    status.classList.add('status');
    const body   = document.createElement('div');
    body.classList.add('body');

    if (spec.class) body.classList.add(spec.class);

    status.appendChild( document.createTextNode("⦻") );
    status.setAttribute('title', spec.command.input);

    body.appendChild( document.createTextNode(spec.text));

    output.appendChild(status);
    output.appendChild(body);

    return output;
  },
  showResult: function (spec) {
    const output = this.buildOutputUnit(spec);
    this.el.appendChild(output);
    this.el.scrollTo({
      top: this.el.scrollHeight,
      behavior: 'smooth',
    });
  },
};

export function Terminal ({ terminalRoot, commando }) {
  const output = new OutputDevice(terminalRoot.querySelector('.output'));
  this.output = output;

  this.cli = terminalRoot.querySelector('.cli');

  this.cli.addEventListener('keyup', function (event) {
    if (event.key !== 'Enter') return;

    const text = this.value;

    if (text.length === 0) return;

    this.value = "";

    const command = CommandParser.parse(text);
    const result  = commando.execute(command);

    output.showResult(result);
  });
}
