import { GoogleGenAI, Type } from '@google/genai'

function parseBase64Image(base64Str: string) {
  if (base64Str.startsWith('data:')) {
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
    if (matches && matches.length === 3) {
      return {
        mimeType: matches[1],
        data: matches[2]
      }
    }
  }
  // Default to image/jpeg if no prefix is present
  return {
    mimeType: 'image/jpeg',
    data: base64Str
  }
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    if (!body || !body.image) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing base64 image data'
      })
    }

    // Determine the API key to use (prioritize user-supplied over server-side env)
    const apiKey = body.apiKey || process.env.GEMINI_API_KEY
    const aiModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite'

    if (!apiKey) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Gemini API Key is required. Please set it in your server .env or provide it in the settings.'
      })
    }

    const { mimeType, data } = parseBase64Image(body.image)

    // Initialize the new Google Gen AI client
    const ai = new GoogleGenAI({ apiKey })

    const response = await ai.models.generateContent({
      model: aiModel,
      contents: [
        {
          inlineData: {
            mimeType,
            data
          }
        },
        "Extract data from this receipt. First, check if image is a valid receipt. If image is not receipt, set 'isReceipt' to false, otherwise true. If an item name has no English description, append the translation behind in brackets. Be precise with prices and quantities. Identify the merchant/shop name and the date of the receipt if visible. If possible, generate a Google Maps search link of where the receipt was taken (incorporating the merchant name, address/branch, and city/country based on currency/context). Important: If a discount applies only to a specific item, record it in that item's 'discount' field. The global 'discount' field should only be used for discounts that apply to the entire bill (e.g., total bill discount, payment method promo). Return a clean JSON object according to the schema."
      ],
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: {
          type: Type.OBJECT,
          properties: {
            isReceipt: { type: Type.BOOLEAN, description: 'True if the image is a valid receipt, invoice, bill, or transactional statement. False if the image is not a receipt (e.g., random objects, scenery, unrelated text).' },
            merchantName: { type: Type.STRING, description: 'The name of the shop/restaurant, or null if not found' },
            date: { type: Type.STRING, description: 'The date of the receipt in YYYY-MM-DD, or null if not found' },
            currency: { type: Type.STRING, description: 'Currency symbol or code (e.g., $, USD, £)' },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "The item name. If does not contain English, translate and append behind in brackets. (Example: 照烧鸡饭 (Teriyaki Chicken Rice))" },
                  quantity: { type: Type.NUMBER },
                  price: { type: Type.NUMBER, description: 'The unit price of the item' },
                  discount: { type: Type.NUMBER, description: 'Total discount specifically for this item/line (as a positive number), if any' }
                },
                required: ['name', 'quantity', 'price']
              }
            },
            tax: { type: Type.NUMBER, description: 'Total tax amount recorded on the receipt' },
            isTaxInItem: { type: Type.BOOLEAN, description: 'Is tax already calculated in item price? If do not know, return false' },
            serviceCharge: { type: Type.NUMBER, description: 'Total service charge or service tax recorded on the receipt' },
            discount: { type: Type.NUMBER, description: 'Global discount amount applied to the total bill after subtotal (as a positive number). Do not include item-specific discounts here.' },
            subtotal: { type: Type.NUMBER, description: 'Subtotal before tax/discount/service charge' },
            total: { type: Type.NUMBER, description: 'Total amount on the receipt' },
            googleMapsUrl: { type: Type.STRING, description: 'A Google Maps search URL for the location where the receipt was taken (e.g., https://www.google.com/maps/search/?api=1&query=Merchant+Name+Address). Construct this URL using the merchant name, the physical address/branch, and the city/country (inferred from currency or receipt details). If the receipt does not have enough location information or a location cannot be determined, set this to null.' }
          },
          required: ['isReceipt', 'merchantName', 'date', 'currency', 'items', 'tax', 'serviceCharge', 'discount', 'subtotal', 'total', 'isTaxInItem', 'googleMapsUrl']
        }
      }
    })

    if (!response || !response.text) {
      throw new Error('Empty response from Gemini API')
    }

    const parsedData = JSON.parse(response.text)

    if (!parsedData || parsedData.isReceipt === false || !parsedData.items || parsedData.items.length === 0) {
      return {
        success: false,
        error: 'NOT_A_RECEIPT'
      }
    }

    // Manual calculations, because I do not trust the AI with calculations
    parsedData["date"] = parsedData["date"] ? parsedData["date"] : new Date().toISOString().split('T')[0];

    // If isTaxInItem is true, it means tax is already included in the item price. Return 0
    parsedData['taxRate'] = !parsedData['isTaxInItem'] ? parsedData['tax'] / parsedData['subtotal'] : 0
    parsedData['serviceChargeRate'] = parsedData['serviceCharge'] / parsedData['subtotal']
    parsedData['discountRate'] = parsedData['discount'] / parsedData['subtotal']

    return {
      success: true,
      data: parsedData
    }
  } catch (error: any) {
    console.error('Error processing receipt:', error)
    return {
      success: false,
      error: error.message || 'Failed to process receipt image'
    }
  }
})
