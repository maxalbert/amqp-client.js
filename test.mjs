import test from 'ava';
import AMQPClient from './amqpclient.mjs';

test('can open a connection and a channel', t => {
  const amqp = new AMQPClient("amqp://")
  return amqp.connect()
    .then((conn) => conn.channel())
    .then((ch) => t.is(ch.connection.channels.length, 2)) // 2 because channel 0 is counted
})


test('can publish and consume', t => {
  const amqp = new AMQPClient("amqp://localhost")
  return new Promise((resolve, reject) => {
    amqp.connect()
      .then((conn) => conn.channel())
      .then((ch) => ch.queue(""))
      .then((q) => q.publish("hello world"))
      .then((q) => q.bind("amq.fanout2"))
      .then((q) => q.subscribe({noAck: false}, (msg) => {
        msg.ack()
        resolve(msg)
      }))
      .catch(reject)
  }).then((result) => t.is(result.bodyString(), "hello world"))
})