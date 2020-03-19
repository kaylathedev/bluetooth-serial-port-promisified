const parentModule = require('bluetooth-serial-port')
const events = require('events')

class BluetoothSerialPort extends events {
  constructor() {
    super()
    this.serialport = new parentModule.BluetoothSerialPort()
    this.serialport.on('closed', () => {
      this.emit('closed')
    })
    this.serialport.on('data', (data) => {
      this.emit('data', data)
    })
    this.serialport.on('debug', () => {
      this.emit('debug')
    })
    this.serialport.on('disconnect', () => {
      this.emit('disconnect')
    })
    this.serialport.on('error', (error) => {
      this.emit('error', error)
    })
    this.serialport.on('failure', () => {
      this.emit('failure')
    })
  }
  inquire() {
    return new Promise(ok => {
      const devices = []
      const found = (address, name) => {
        devices.push({
          address: address,
          name: name
        })
      }
      const finished = () => {
        this.serialport.removeListener('found', found)
        this.serialport.removeListener('finished', finished)
        this.nearby = devices
        ok(devices)
      }
      this.serialport.on('found', found)
      this.serialport.on('finished', finished)
      this.serialport.inquire()
    })
  }
  findSerialPortChannel(address) {
    return new Promise((ok, fail) => {
      this.serialport.findSerialPortChannel(address, channel => {
        ok(channel)
      }, () => {
        fail(new Error('Unable to find serial port channel'))
      })
    })
  }
  connect(address, channel) {
    return new Promise(async (ok, fail) => {
      try {
        if (channel === undefined) {
          channel = await this.findSerialPortChannel(address)
        }
        this.serialport.connect(address, channel, () => {
          this.address = address
          this.channel = channel
          ok()
        }, error => {
          fail(error)
        })
      } catch (error) {
        fail(error)
      }
    })
  }
  write(buffer) {
    if (typeof buffer === 'string') {
      buffer = Buffer.from(buffer, 'utf8')
    }
    return new Promise((ok, fail) => {
      this.serialport.write(buffer, (error, bytesWritten) => {
        if (error) {
          fail(error)
        } else {
          ok()
        }
      })
    })
  }
  close() {
    this.serialport.close()
  }
  isOpen() {
    return this.serialport.isOpen()
  }
  listPairedDevices() {
    return new Promise(ok => {
      this.serialport.listPairedDevices(pairedDevices => {
        ok(pairedDevices)
      })
    })
  }
}

module.exports.BluetoothSerialPort = BluetoothSerialPort

if (parentModule.BluetoothSerialPortServer) {
  class BluetoothSerialPortServer extends events {
    constructor() {
      super()
      this.server = new parentModule.BluetoothSerialPortServer()
      this.server.on('closed', () => {
        this.emit('closed')
      })
      this.server.on('data', (data) => {
        this.emit('data', data)
      })
      this.server.on('disconnected', () => {
        this.emit('disconnected')
      })
      this.server.on('error', (error) => {
        this.emit('error', error)
      })
      this.server.on('failure', () => {
        this.emit('failure')
      })
    }
    listen(a, b) {
      var actualOptions = {}
      if (a && a.constructor === Object) {
        Object.assign(actualOptions, a)
      }
      if (typeof a === 'number') {
        actualOptions.channel = a
      } else if (typeof a === 'string') {
        actualOptions.uuid = a
      }
      if (typeof b === 'number') {
        actualOptions.channel = b
      } else if (typeof b === 'string') {
        actualOptions.uuid = b
      }
      return new Promise((ok, fail) => {
        this.server.listen(function (clientAddress) {
          ok(clientAddress)
        }, function (error) {
          fail(error)
        }, actualOptions);
      })
    }
    write(buffer) {
      if (typeof buffer === 'string') {
        buffer = Buffer.from(buffer, 'utf8')
      }
      return new Promise((ok, fail) => {
        this.server.write(buffer, (error, bytesWritten) => {
          if (error) {
            fail(error)
          } else {
            ok()
          }
        })
      })
    }
    disconnectClient() {
      this.server.disconnectClient()
    }
    close() {
      this.server.close()
    }
    isOpen() {
      return this.server.isOpen()
    }
  }
  module.exports.BluetoothSerialPortServer = BluetoothSerialPortServer
}