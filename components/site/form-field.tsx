export function Field({
  label,
  name,
  type = "text",
  required = true,
  error,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  error?: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="font-body text-[13px] font-semibold text-[#1A1A1A]">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="rounded-lg border border-[#E6E4DF] px-3 py-2 font-body text-sm text-[#1A1A1A] outline-none focus:border-[#FF5A36]"
      />
      {error ? <p className="font-body text-xs text-red-600">{error}</p> : null}
    </div>
  )
}

export function SelectField({
  label,
  name,
  options,
}: {
  label: string
  name: string
  options: readonly { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="font-body text-[13px] font-semibold text-[#1A1A1A]">
        {label}
      </label>
      <select
        id={name}
        name={name}
        className="rounded-lg border border-[#E6E4DF] px-3 py-2 font-body text-sm text-[#1A1A1A] outline-none focus:border-[#FF5A36]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
