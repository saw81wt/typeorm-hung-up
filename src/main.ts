import { AppDataSource } from "../typeorm/data-source"
import { User } from "../typeorm/entity/User"

const main = async () => {
    await AppDataSource.initialize()
    const findUserWithPhoto = async () => {
        const repository = AppDataSource.getRepository(User)
        return await repository.findOne({
            where: { id: 1 },
            relations: {
                photos: true
            },
            relationLoadStrategy: "query"
        })
    }

    const result = []
    for (let i = 0; i < 10; i++) {
        result.push(findUserWithPhoto())
    }
    await Promise.all(result)
    await AppDataSource.destroy()
}

main()