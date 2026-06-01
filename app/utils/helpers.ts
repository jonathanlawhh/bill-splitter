/**
 * Formats a numeric value into currency representation dynamically.
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  const cleanCurrency = (currency || 'USD').trim()
  if (/^[A-Za-z]{3}$/.test(cleanCurrency)) {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: cleanCurrency.toUpperCase()
      }).format(value || 0)
    } catch (e) { }
  }
  const numStr = Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  return `${cleanCurrency} ${numStr}`
}

/**
 * Converts a File object to a base64 encoded string.
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

/**
 * Safe Base64 encoding for Unicode strings (e.g. contains UTF-8/Chinese characters)
 */
export function safeBtoa(str: string): string {
  try {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
      return String.fromCharCode(parseInt(p1, 16))
    }))
  } catch (e) {
    console.error('Failed to encode base64', e)
    return ''
  }
}

/**
 * Safe Base64 decoding for Unicode strings
 */
export function safeAtob(str: string): string {
  const normalized = str.replace(/ /g, '+');

  return decodeURIComponent(
    Array.prototype.map.call(atob(normalized), (c: string) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join('')
  )

}

/**
 * Saves a bill to history in localStorage
 */
export function saveBillToHistory(billData: any): void {
  if (typeof window === 'undefined') return
  try {
    const payload = JSON.stringify(billData)
    const encoded = safeBtoa(payload)
    if (!encoded) return

    const history = getBillHistory()
    // Avoid storing the exact same bill consecutively
    if (history[0] !== encoded) {
      history.unshift(encoded)
      localStorage.setItem('bill_history', JSON.stringify(history))
    }
  } catch (e) {
    console.error('Failed to save bill to history', e)
  }
}

/**
 * Retrieves the bill history array from localStorage
 */
export function getBillHistory(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const historyStr = localStorage.getItem('bill_history')
    if (historyStr) {
      const history = JSON.parse(historyStr)
      if (Array.isArray(history)) {
        return history
      }
    }
  } catch (e) {
    console.error('Failed to parse bill history', e)
  }
  return []
}

/**
 * Deletes a specific bill from history by index
 */
export function deleteBillFromHistory(index: number): void {
  if (typeof window === 'undefined') return
  try {
    const history = getBillHistory()
    if (index >= 0 && index < history.length) {
      history.splice(index, 1)
      localStorage.setItem('bill_history', JSON.stringify(history))
    }
  } catch (e) {
    console.error('Failed to delete bill from history', e)
  }
}

/**
 * Clears all bill history from localStorage
 */
export function clearBillHistory(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem('bill_history')
  } catch (e) {
    console.error('Failed to clear bill history', e)
  }
}
