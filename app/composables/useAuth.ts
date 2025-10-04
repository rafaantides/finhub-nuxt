export const useAuth = () => {
  const signOut = async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      await navigateTo('/login')
    }
  }

  return {
    signOut
  }
}
