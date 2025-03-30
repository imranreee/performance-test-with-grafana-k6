function parseDuration(durationStr) {
    const match = durationStr.match(/^(\d+)([smh])$/);
    if (!match) {
        throw new Error(`Invalid duration format: ${durationStr}`);
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 3600;
        default: throw new Error(`Unsupported duration unit: ${unit}`);
    }
}
