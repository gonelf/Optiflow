import React from 'react'

interface StructuredDataProps {
    data: object | object[]
}

/**
 * Component to embed JSON-LD structured data in the page
 * This helps search engines and LLMs understand the content better
 */
export function StructuredData({ data }: StructuredDataProps) {
    const jsonLd = Array.isArray(data) ? data : [data]

    return (
        <>
            {jsonLd.map((item, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(item),
                    }}
                />
            ))}
        </>
    )
}
