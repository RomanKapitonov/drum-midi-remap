use std::process::exit;

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 5 {
        eprintln!("usage: midiremap <in.mid> <src_id> <tgt_id> <out.mid> [--user-map <file.json>]");
        exit(2);
    }
    let (in_path, src_id, tgt_id, out_path) = (&args[1], &args[2], &args[3], &args[4]);

    let mut reg = midiremap_core::builtin();
    if let Some(pos) = args.iter().position(|a| a == "--user-map") {
        let path = match args.get(pos + 1) {
            Some(p) => p,
            None => {
                eprintln!("--user-map needs a file path");
                exit(2);
            }
        };
        let json = std::fs::read_to_string(path).unwrap_or_else(|e| {
            eprintln!("cannot read user map {path}: {e}");
            exit(1);
        });
        reg.load_user_json(&json).unwrap_or_else(|e| {
            eprintln!("invalid user map: {e}");
            exit(1);
        });
    }

    let src = reg.get(src_id).unwrap_or_else(|| {
        eprintln!("unknown source engine '{src_id}'");
        exit(1);
    });
    let tgt = reg.get(tgt_id).unwrap_or_else(|| {
        eprintln!("unknown target engine '{tgt_id}'");
        exit(1);
    });

    let mid = std::fs::read(in_path).unwrap_or_else(|e| {
        eprintln!("cannot read {in_path}: {e}");
        exit(1);
    });
    let out = midiremap_core::remap(&mid, src, tgt).unwrap_or_else(|e| {
        eprintln!("remap failed: {e}");
        exit(1);
    });

    std::fs::write(out_path, &out.bytes).unwrap_or_else(|e| {
        eprintln!("cannot write {out_path}: {e}");
        exit(1);
    });
    eprintln!("{}", serde_json::to_string_pretty(&out.report).unwrap());
}
