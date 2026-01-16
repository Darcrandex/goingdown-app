export default function ResetPasswordEmail(props: { resetUrl: string }) {
  const { resetUrl } = props
  const styles = {
    wrapper: {
      width: '100%',
      backgroundColor: '#f7fafc',
      padding: '24px 0',
    },
    container: {
      width: '100%',
      maxWidth: '600px',
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      fontFamily: "-apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      color: '#0f172a',
    },
    h1: {
      margin: 0,
      marginBottom: '12px',
      fontSize: '20px',
      lineHeight: '28px',
      fontWeight: 700,
    },
    p: {
      margin: 0,
      marginBottom: '12px',
      fontSize: '14px',
      lineHeight: '22px',
      color: '#334155',
    },
    button: {
      display: 'inline-block',
      marginTop: '8px',
      marginBottom: '16px',
      padding: '12px 16px',
      backgroundColor: '#f43f5e',
      color: '#ffffff',
      textDecoration: 'none',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 600,
    },
    link: {
      display: 'block',
      fontSize: '12px',
      lineHeight: '20px',
      color: '#0ea5e9',
      textDecoration: 'underline',
      wordBreak: 'break-all',
    },
    footer: {
      marginTop: '16px',
      fontSize: '12px',
      lineHeight: '20px',
      color: '#64748b',
    },
  } as const

  return (
    <table style={styles.wrapper} role='presentation' cellPadding={0} cellSpacing={0}>
      <tbody>
        <tr>
          <td align='center'>
            <div style={styles.container}>
              <h1 style={styles.h1}>Reset your password</h1>
              <p style={styles.p}>Click the button below to reset your password.</p>
              <a href={resetUrl} target='_blank' rel='noopener noreferrer' style={styles.button}>
                Reset Password
              </a>
              <p style={styles.p}>If the button doesn&apos;t work, copy and paste this link:</p>
              <a href={resetUrl} target='_blank' rel='noopener noreferrer' style={styles.link}>
                {resetUrl}
              </a>
              <p style={styles.footer}>If you didn&apos;t request this, you can ignore this email.</p>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
