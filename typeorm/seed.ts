import { AppDataSource } from "./data-source";
import { User } from "./entity/User";

const main = async () => {
  await AppDataSource.initialize()

  const result = await AppDataSource.getRepository(User).save({
    name: "test",
    photos: [{
      url: "test",
    }],
  })

  console.log("Created user:", result)

  await AppDataSource.destroy()
}

main()
