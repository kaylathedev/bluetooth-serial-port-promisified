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
