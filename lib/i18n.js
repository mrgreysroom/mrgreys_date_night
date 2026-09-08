import {headers} from 'next/headers'
export const supported=['sk','cs','pl','en']
export function getLang(){const l=headers().get('x-mrgreys-lang')||'sk';return supported.includes(l)?l:'sk'}
