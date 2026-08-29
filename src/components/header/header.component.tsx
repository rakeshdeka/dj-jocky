import Styles from './header.module.css';
export default function H1({ text }: { text: string }) {
	return <h1 className={Styles.header1}>{text}</h1>;
}
