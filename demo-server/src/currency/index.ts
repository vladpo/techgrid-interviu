import { io } from '../websocket'
import { Currency, CurrencyQuote } from 'demo-common'

function randomCurrencyQuotes(): CurrencyQuote[] {
  return [
    {
      currency: Currency.EUR,
      quote: randomCurrencyQuote(4.0, 5.5)
    },
    {
      currency: Currency.USD,
      quote: randomCurrencyQuote(3.0, 4.0)
    },
    {
      currency: Currency.GBP,
      quote: randomCurrencyQuote(5.0, 6.0)
    }
  ]
}

function randomCurrencyQuote(min: number, max: number) {
  return Math.random() * (max - min) + min
}

const emitQuotes = () => {
  setInterval(() => {
    const currencyQuotes = randomCurrencyQuotes()
    io.sockets.emit('currency:quotes', currencyQuotes)
  }, 5000)
}

export default emitQuotes
