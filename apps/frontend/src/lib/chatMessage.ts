export interface ListingReference {
  listingId: number
  title?: string
}

const LISTING_ID_REGEX = /listing\s*#(\d+)/i
const LISTING_TITLE_REGEX = /"(.+?)"\s*\(listing\s*#\d+\)/i

export const extractListingReference = (content: string): ListingReference | null => {
  const listingIdMatch = LISTING_ID_REGEX.exec(content)
  if (!listingIdMatch) return null

  const listingId = Number(listingIdMatch[1])
  if (!Number.isInteger(listingId) || listingId <= 0) return null

  const titleMatch = LISTING_TITLE_REGEX.exec(content)
  const title = titleMatch?.[1]?.trim()

  return title ? { listingId, title } : { listingId }
}
