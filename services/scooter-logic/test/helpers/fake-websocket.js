export class FakeWebSocket {
  static OPEN = 1;
  static CLOSED = 3;

  static instances = [];

  constructor(url) {
    this.url = url;
    this.readyState = 0;

    this.sent = [];
    this.onopen = null;
    this.onmessage = null;
    this.onclose = null;
    this.onerror = null;

    FakeWebSocket.instances.push(this);
  }

  send(data) {
    this.sent.push(data);
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.();
  }

  // Test controls
  _open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }

  _message(obj) {
    const data = typeof obj === "string" ? obj : JSON.stringify(obj);
    this.onmessage?.({ data });
  }

  _triggerClose() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.();
  }

  static reset() {
    FakeWebSocket.instances = [];
  }
}
