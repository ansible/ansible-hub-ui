export class RandomGenerator {
    static lipsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget nisl quis diam lacinia pretium. Donec pharetra varius erat in condimentum. Maecenas sed tortor fringilla, congue lectus sit amet, ultricies urna. Nam sodales mi quis lacus condimentum, id semper nunc ultrices. In sem orci, condimentum eu magna quis, faucibus ultricies metus. Nullam justo dolor, convallis sed lacinia eget, semper ac massa. Curabitur turpis metus, auctor sed tellus et, dictum aliquam velit.`;

    static words = [
        'network',
        'security',
        'rhel',
        'cloud',
        'system',
        'collection',
        'ubuntu',
        'kubernetes',
        'container',
        'package',
        'system',
        'compliance',
        'plugins',
        'modules',
        'roles',
    ];

    static randNum(max) {
        return Math.floor(Math.random() * max);
    }

    static randDate(start, end) {
        return new Date(
            start.getTime() + Math.random() * (end.getTime() - start.getTime()),
        );
    }

    static randWords(length) {
        const w: string[] = [];

        const n = this.randNum(length);

        for (let i = 0; i < n; i++) {
            w.push(this.words[this.randNum(this.words.length)]);
        }

        return w;
    }

    static randString(length) {
        return this.lipsum.substring(0, this.randNum(length));
    }
}
