declare namespace JSX {
  interface IntrinsicElements {
    'uc-file-uploader-regular': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        'public-key'?: string
        'css-src'?: string
      },
      HTMLElement
    >
  }
}
