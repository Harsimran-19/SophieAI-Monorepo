import click

from career_coaches.domain.coach_factory import CoachFactory


@click.command()
def main() -> None:
    """CLI command to list all available career coaches."""

    coach_factory = CoachFactory()
    available_coaches = coach_factory.get_available_coaches()

    print("\033[32m=== Available Career Coaches ===\033[0m")
    print()

    for coach_id in available_coaches:
        coach = coach_factory.get_coach(coach_id)
        
        print(f"\033[36m{coach.name}\033[0m")
        print(f"  ID: {coach.id}")
        print(f"  Specialty: {coach.specialty}")
        print(f"  Focus Areas:")
        for area in coach.focus_areas:
            print(f"    • {area}")
        print()
        print(f"  Approach: {coach.approach[:100]}...")
        print()
        print("-" * 60)
        print()

    print(f"\033[32mTotal coaches available: {len(available_coaches)}\033[0m")


if __name__ == "__main__":
    main()
