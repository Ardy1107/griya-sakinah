import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('theme') || 'dark'
        } catch (e) {
            return 'dark'
        }
    })

    useEffect(() => {
        try {
            localStorage.setItem('theme', theme)
        } catch (e) {
            console.warn('Could not save theme to localStorage')
        }
        if (theme === 'light') {
            document.body.classList.add('light-theme')
        } else {
            document.body.classList.remove('light-theme')
        }
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
