import styles from './button.module.css';
type ButtonProps = {
	text: any;
	className: string;
	type?: 'button' | 'submit' | 'reset' | undefined;
	disabled?: boolean;
	onClick?: (
		e: React.MouseEvent<HTMLButtonElement>
	) => void;
};

export default function Button({
	text,
	className = '',
	type = 'button',
	disabled,
	onClick,
}: ButtonProps) {
	return (
		<button
			className={`${className} ${styles.btn_default} `}
			{...{ disabled, type, onClick }}>
			{text}
		</button>
	);
}
