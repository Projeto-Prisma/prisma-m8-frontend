import logo from '../assets/logo.png';

export default function Logo({ className = '', width = 42, height = 42, title = 'Prisma Recife' }) {
  return (
    <img
      className={className}
      src={logo}
      width={width}
      height={height}
      alt={title}
      aria-label={title}
    />
  );
}
