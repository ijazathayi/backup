import { useCallback, useState } from 'react'

/**
 * Returns { fetchIp, fetching }
 * fetchIp(setter, cidr?) — fetches /api/myip and calls setter with the result.
 *   cidr = undefined  → sets plain IP
 *   cidr = 24 | 25    → sets IP/cidr  (e.g. 192.168.1.5/24)
 *   cidr = 'subnet'   → sets x.x.x.0/24 (network address)
 */
export function useMyIp() {
  const [fetching, setFetching] = useState(false)

  const fetchIp = useCallback(async (setter, cidr) => {
    setFetching(true)
    try {
      const r = await fetch('/api/myip')
      const { ip } = await r.json()
      if (!ip) return
      if (cidr === 'subnet') {
        const parts = ip.split('.')
        setter(`${parts[0]}.${parts[1]}.${parts[2]}.0/24`)
      } else if (cidr) {
        setter(`${ip}/${cidr}`)
      } else {
        setter(ip)
      }
    } catch {
      // silently ignore — backend offline indicator is already in topbar
    } finally {
      setFetching(false)
    }
  }, [])

  return { fetchIp, fetching }
}
