const EventEmitter = require('events');

class QueueAdapter extends EventEmitter {
  publish(event, payload) {
    this.emit(event, payload);
  }
}

const queue = new QueueAdapter();

module.exports = { queue };
