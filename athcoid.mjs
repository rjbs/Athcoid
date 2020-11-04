const commandant = {
  marshal: function (str) {
    const match = str.match(/^(\S+)(?:\s*|\s+(.+))?$/);

    return {
      arg0: match[1],
      rest: match[2],
      input: str,
    };
  },
};

const actor = {
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
  commands: {
    help: function (command) {
      return {
        text: "Known commands: echo, help",
      };
    },
    echo: function (command) {
      return {
        text: `ECHO: ${command.rest}`,
      }
    },
  },
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

export function Terminal (root) {
  const output = this.output = new OutputDevice(root.querySelector('.output'));

  this.cli = root.querySelector('.cli');

  this.cli.addEventListener('keyup', function (event) {
    if (event.key !== 'Enter') return;

    const text = this.value;

    if (text.length === 0) return;

    this.value = "";

    const command = commandant.marshal(text);
    const result  = actor.execute(command);

    output.showResult(result);
  });
}
