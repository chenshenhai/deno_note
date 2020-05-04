#![cfg(not(windows))]

// use deno::test_util::*;
use std::process::Command;

fn deno_cmd() -> Command {
    // assert!(deno_exe_path().exists());
    // Command::new(deno_exe_path())
    Command::new("deno")
}

#[cfg(debug_assertions)]
const BUILD_VARIANT: &str = "debug";

#[cfg(not(debug_assertions))]
const BUILD_VARIANT: &str = "release";

#[test]
fn basic() {
    let mut build_plugin_base = Command::new("cargo");
    // let mut build_plugin = build_plugin_base.arg("build").arg("-p").arg("test_plugin");
    let mut build_plugin = build_plugin_base.arg("build");
    if BUILD_VARIANT == "release" {
        build_plugin = build_plugin.arg("--release");
    }
    let build_plugin_output = build_plugin.output().unwrap();
    assert!(build_plugin_output.status.success());
    let output = deno_cmd()
        .arg("--allow-plugin")
        .arg("tests/test.ts")
        .arg(BUILD_VARIANT)
        .output()
        .unwrap();
    let stdout = std::str::from_utf8(&output.stdout).unwrap();
    let stderr = std::str::from_utf8(&output.stderr).unwrap();
    if !output.status.success() {
        println!("stdout {}", stdout);
        println!("stderr {}", stderr);
    }
    assert!(output.status.success());
    let expected = if cfg!(target_os = "windows") {
        "[Rust] op_test_sync:receive (\"Hello! Sync control\", \"Hello! Sync zeroCopy\")\r\n[Deno] testSync Response: Ok! Sync\r\n[Rust] op_test_async:receive (\"Hello! Async control\", \"Hello! Async zeroCopy\")\r\n[Deno] testAsync Response: Ok! Async\r\n"
    } else {
        "[Rust] op_test_sync:receive (\"Hello! Sync control\", \"Hello! Sync zeroCopy\")\n[Deno] testSync Response: Ok! Sync\n[Rust] op_test_async:receive (\"Hello! Async control\", \"Hello! Async zeroCopy\")\n[Deno] testAsync Response: Ok! Async\n"
    };
    assert_eq!(stdout, expected);
    assert_eq!(stderr, "");
}
