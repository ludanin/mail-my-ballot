import { GeorgiaInfo, processEnvOrThrow } from "../../common"
import { EmailData } from "../mg"
import stripIndent from 'strip-indent'

export const toEmailData = (
  {
    name,
    uspsAddress,
    email,
    phone,
    county,
    birthdate,
    mailingAddress,
    signature,
    electionType,
    electionDate,
  }: GeorgiaInfo
): EmailData => {
  const brandName = processEnvOrThrow('REACT_APP_BRAND_NAME')
  const url = processEnvOrThrow('REACT_APP_URL')

  // https://sos.ga.gov/admin/uploads/Absentee_Voting_Guide_20142.pdf

  const md = stripIndent(`
  Dear Election Official,

  I am writing to request an Absentee or Vote-by-Mail ballot through [${brandName}](${url}), following the requirements laid out on the [Secretary of State's website](https://sos.ga.gov/admin/uploads/Absentee_Voting_Guide_20142.pdf).
  
  Below are my voter registration details:

  - Name: **${name}**
  - Birth Year: **${birthdate}**
  - Voter Registration Address: **${uspsAddress}**
  - Mailing Address: ${ mailingAddress ? `**${mailingAddress}**` : 'Same as registration address' }
  - Email: ${email}
  - Phone: **${phone}**
  - County: **${county}**
  - Election: **${electionType}**
  - Election Date: **${electionDate}**

  Thank you in advance for your assistance.  If you have any questions, please email me at the address provided.

  Sincerely,

  ${name} (Signature Attached)

  <img src="${signature}">
  `)

  return {
    to: [email],
    subject: 'Vote By Mail Request',
    md,
    signature,
  }
}