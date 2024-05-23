export const shuffle = <T>(array: T[]) => {
	array = [...array];
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export const choices = <T>(array: T[], k=1) => {
	array = [...array];
	const out: T[] = [];
	for (let i = 0; i < k; ++i) {
		const j = Math.floor(Math.random() * array.length);
		out.push(...array.splice(j, 1));
	}
	return out;
}

