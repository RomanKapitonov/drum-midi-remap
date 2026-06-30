use std::process::Command;

#[test]
fn prints_usage_when_args_missing() {
    let out = Command::new(env!("CARGO_BIN_EXE_midiremap"))
        .output()
        .unwrap();
    assert!(!out.status.success());
    let err = String::from_utf8_lossy(&out.stderr);
    assert!(err.contains("usage"), "stderr was: {err}");
}
