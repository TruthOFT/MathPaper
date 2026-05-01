const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export type ApiResult<T> = {
    code: number
    message: string
    data: T
}

export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${apiBaseUrl}${url}`, {
        credentials: 'include',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers ?? {}),
        },
    })

    const result = (await response.json()) as ApiResult<T>

    if (!response.ok || result.code !== 0) {
        throw new Error(result.message || `请求失败：${response.status}`)
    }

    return result.data
}
