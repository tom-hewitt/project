export function ObjectIcon(props: { color: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M1.45508 3.27273L6.00053 1L10.4443 3.22188M1.45508 3.27273V8.72727L6.00053 11M1.45508 3.27273L6.00053 5.54545M6.00053 11L10.546 8.72727V3.27273L10.4443 3.22188M6.00053 11V5.54545M6.00053 5.54545L10.4443 3.22188"
        stroke={props.color}
      />
    </svg>
  );
}

export function ArrayIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1.5 2.5H10.5M1.5 9.5H10.5M1.5 6H10.5" stroke="#D6D6D6" />
    </svg>
  );
}
