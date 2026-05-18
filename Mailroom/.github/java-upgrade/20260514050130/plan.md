# Upgrade Plan: mailroom (20260514050130)

- **Generated**: 2026-05-14 05:01:30
- **HEAD Branch**: feature/safety-net
- **HEAD Commit ID**: N/A

## Available Tools

**JDKs**
- JDK 17.0.12: C:\Program Files\Eclipse Adoptium\jdk-17.0.12.7-hotspot\bin (current project JDK, used by baseline)
- JDK 21.0.8: C:\Users\HP\.jdks\ms-21.0.8\bin (required by step 4)

**Build Tools**
- Maven 3.9.15: C:\apache-maven-3.9.15\bin
- Maven Wrapper: none detected

## Guidelines

> Note: You can add any specific guidelines or constraints for the upgrade process here if needed, bullet points are preferred.

- Upgrade the runtime target to the latest LTS Java 21.
- Preserve the existing Jakarta Mail usage and minimal project structure.

## Options

- Working branch: appmod/java-upgrade-20260514050130
- Run tests before and after the upgrade: true

## Upgrade Goals

- Java 21

## Technology Stack

| Technology/Dependency    | Current | Min Compatible | Why Incompatible |
| ------------------------ | ------- | -------------- | ---------------------------------------------- |
| Java                     | 17      | 21             | User requested latest LTS runtime             |
| Maven                    | 3.9.15  | 3.9.0          | Required for Java 21 support                   |
| maven-compiler-plugin    | default | 3.11.0         | Java 21 compilation requires newer plugin      |
| jakarta.mail / angus-mail| 2.0.2   | 2.0.2          | Already Jakarta-based, compatible with Java 21 |

## Derived Upgrades

- Upgrade Maven compiler configuration to target Java 21 using a modern `maven-compiler-plugin`.
- Use `maven.compiler.release` to ensure bytecode and API targeting align with Java 21.
- Keep Maven 3.9.15 in use since it already supports Java 21 and is available locally.

## Upgrade Steps

- Step 1: Setup Environment
  - **Rationale**: Confirm the required Java 21 runtime and Maven 3.9+ toolchain are available before making project changes.
  - **Changes to Make**: None in source; verify environment availability.
  - **Verification**: `mvn -version` and `java -version` with Java 21 available, expected success.

- Step 2: Setup Baseline
  - **Rationale**: Capture the current project health on Java 17 before upgrading.
  - **Changes to Make**: None in source; run baseline compile/test.
  - **Verification**: `mvn clean compile test-compile -q && mvn clean test -q` with Java 17, expected success.

- Step 3: Upgrade Java target to 21
  - **Rationale**: Update Maven compiler settings to Java 21 and lock in a compatible compiler plugin for the new runtime level.
  - **Changes to Make**:
    - Set `maven.compiler.release` to `21`.
    - Add explicit `maven-compiler-plugin` version `3.11.0`.
    - Add `maven-surefire-plugin` version `3.1.2` for reliable test execution.
  - **Verification**: `mvn clean test-compile -q` with Java 21, expected compile success.

- Step 4: Final Validation
  - **Rationale**: Ensure the upgraded project compiles and passes all tests on Java 21.
  - **Changes to Make**: Resolve any Java 21 compatibility issues surfaced by the full build.
  - **Verification**: `mvn clean test -q` with Java 21, expected success.

## Key Challenges

- **Java 17 → Java 21 Compatibility**
  - **Challenge**: The upgrade may expose new language or JDK API removal behavior between Java 17 and 21.
  - **Strategy**: Use a source-level review and a clean build on Java 21; the project source currently uses only standard Jakarta Mail APIs and no known removed JDK internals.

- **Maven Compiler Plugin Compatibility**
  - **Challenge**: Older Maven compiler plugin versions may not support Java 21 language/features.
  - **Strategy**: Pin `maven-compiler-plugin` to `3.11.0` and use `maven.compiler.release=21`.
