export function FormField({
  id,
  label,
  hint,
  error,
  children,
  className = '',
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-300"
      >
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
      {error ? <p className="mt-1 text-xs text-rose-400">{error}</p> : null}
    </div>
  )
}

export function TextInput(props) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition',
        'focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20',
        props.readOnly ? 'cursor-not-allowed opacity-80' : '',
        props.className || '',
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

export function SelectInput({ children, ...props }) {
  return (
    <select
      {...props}
      className={[
        'w-full rounded-xl border border-slate-700 bg-slate-950/50 px-3 py-2.5 text-sm text-white outline-none transition',
        'focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20',
        props.className || '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </select>
  )
}
