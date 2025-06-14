export const handler = async (): Promise<any> => {
  console.log('Running keep-alive at:', new Date().toISOString())

  const urls = [
    'https://dev.app.estateedge.com.au/api/public/public-listings',
    'https://app.estateedge.com.au/api/public/public-listings',
  ]

  try {
    const counts = await Promise.all(
      urls.map(async url => {
        const res = await fetch(url)
        if (!res.ok) {
          throw new Error(
            `Fetch failed for ${url}: ${res.status} ${res.statusText}`,
          )
        }

        const data = await res.json()
        const length = Array.isArray(data) ? data.length : 0

        console.log(`Fetched ${length} listings from ${url}`)
        return length
      }),
    )

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Keep-alive successful',
        devCount: counts[0],
        prodCount: counts[1],
        timestamp: new Date().toISOString(),
      }),
    }
  } catch (error) {
    console.error('Error during keep-alive ping:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error instanceof Error ? error.message : error,
      }),
    }
  }
}
